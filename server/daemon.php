<?php

define('INPUT_FILTER', FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);
define('SOCKET_DIR', '/var/www/sockets/');
define('LOGFILE', '/var/www/sockets/log');
define('HASH_FILE', '/var/www/sockets/hashes');
logger('Starting.');

declare(ticks = 1);
set_time_limit(0);
ob_implicit_flush();

function addHash($hash) {
    $hashes = unserialize(file_get_contents(HASH_FILE));
    $hashes[] = array(
        'time' => time(),
        'hash' => $hash,
    );
    file_put_contents(HASH_FILE, serialize($hashes));
}

function getHashes() {
    return unserialize(file_get_contents(HASH_FILE));
}

function removeHash($hash) {
    $hashes = unserialize(file_get_contents(HASH_FILE));
    foreach ($hashes as $index => $hashData) {
        if ($hashData['hash'] === $hash) {
            break;
        }
    }
    if ($index !== false) {
        array_splice($hashes, $index, 1);
        file_put_contents(HASH_FILE, serialize($hashes));
    }
}

function logger($message) {
    file_put_contents(LOGFILE, sprintf("%d %s\n", time(), $message), FILE_APPEND);
}

function sig_handler($sig) {
    echo sprintf("Signal: %s\n", $sig);
    switch($sig) {
        case SIGTERM:
        case SIGINT:
            echo "Exiting.";
            exit();
        break;

        case SIGCHLD:
            echo "Created child.\n";
            pcntl_waitpid(-1, $status);
        break;
    }
}

function startHandler($client, $data) {
    $hash = md5(rand(0, 500));
    addHash($hash);
    $address = SOCKET_DIR . 'doped-' . $hash . '.socket';

    $pid = pcntl_fork();

    if ($pid == -1) {
        socket_write(
            $client,
            json_encode(array(
            'status' => 500,
            'message' => 'Fork failure.',
            )) . "\n"
        );
        socket_close($client);
        return;
    } else if ($pid) {
        socket_write(
            $client,
            json_encode(array(
                'status' => 200,
                'message' => 'Connection stablished.',
                'connectionId' => $hash,
                'pid' => $pid,
            )) . "\n"
        );
        socket_close($client);

        echo sprintf("Connection handled: %s\n", $hash);
        return;
    } else {
        socket_close($client);
        posix_setsid();
        chdir('/');
        umask(0);

        logger('Forked to a pid: ' . posix_getpid());

        $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
        //socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

        if ($socket === false) {
            throw new Exception('Unable to create the socket.');
        }

        socket_bind($socket, $address);
        socket_listen($socket);
        socket_set_nonblock($socket);

        $quit = false;
        $cmd = '';
        $clients = array();

        while ($quit === false) {
            if (($client = socket_accept($socket)) !== false) {
                logger('New incomming connection');
                socket_set_nonblock($client);
                $json = socket_read($client, 100, PHP_NORMAL_READ);
                $data = json_decode($json, true);

                if (isset($data['command']) && $data['command'] !== '') {
                    $cmd = $data['command'];

                    logger('New controller command: ' . $cmd);

                    foreach ($clients as $index => $clientSocket) {
                        logger('Sending message to a client: ' . $cmd);
                        $written = @socket_write($clientSocket, json_encode(array(
                            'command' => $cmd,
                            'slideNumber' => isset($data['slideNumber'])?$data['slideNumber']:null,
                        )) . "\n");

                        if ($written !== false) {
                            logger('Message sent.');
                        } else {
                            array_slice($clients, $index, 1);
                            logger('Removed one client.');
                        }
                    }

                    logger('All clients informed: ');
                    socket_write(
                        $client,
                        json_encode(array(
                            'status' => 200,
                            'command' => $cmd,
                            'totalClients' => count($clients),
                        )) . "\n"
                    );
                } else {
                    $clients[] = $client;
                }
            }

            if ($cmd && $cmd === 'quit') {
                $quit = true;
                $cmd = null;
            }

            usleep(100);
        }

        foreach ($clients as $clientSocket) {
            socket_close($clientSocket);
        }

        @socket_close($socket);
        @unlink($address);
        removeHash($hash);
        exit();
    }
}

pcntl_signal(SIGTERM, 'sig_handler');
pcntl_signal(SIGINT, 'sig_handler');
pcntl_signal(SIGCHLD, 'sig_handler');

@unlink(SOCKET_DIR . 'doped.socket');
$socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
//socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

if ($socket === false) {
    throw new Exception('Unable to create the socket.');
}

$startTime = time();
socket_bind($socket, SOCKET_DIR . 'doped.socket');
socket_listen($socket);
socket_set_nonblock($socket);

$cmd = '';

while (true) {
    if (($client = @socket_accept($socket)) !== false) {
        $json = socket_read($client, 100);

        $data = json_decode($json, true);
        $cmd = $data['command'];

        if ($cmd === 'create') {
            startHandler($client, $data);
        } else if ($cmd === 'query') {
            echo "Quering.\n";
            socket_write(
                $client,
                json_encode(array(
                    'status' => 200,
                    'hashes' => getHashes(),
                )) . "\n"
            );

            socket_close($client);
        } else {
            echo "Unable to fork.\n";
            socket_write(
                $client,
                json_encode(array(
                    'status' => 400,
                    'message' => 'Unable to fork the server.',
                )) . "\n"
            );

            socket_close($client);
        }
    }

    usleep(100);
}

socket_close($socket);
