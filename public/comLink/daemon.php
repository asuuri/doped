<?php

define('INPUT_FILTER', FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);

header('Content-Type: application/json');

set_time_limit(0);
ob_implicit_flush();

function sig_handler($sig) {
    switch($sig) {
        case SIGTERM:
        case SIGINT:
            exit();
        break;

        case SIGCHLD:
            pcntl_waitpid(-1, $status);
        break;
    }
}

pcntl_signal(SIGTERM, 'sig_handler');
pcntl_signal(SIGINT, 'sig_handler');
pcntl_signal(SIGCHLD, 'sig_handler');

$request = (object) array(
    'connectionId' => $argv[1],
);

$address = '/var/www/sockets/doped-rx_' . $request->connectionId . '.socket';

$hash = md5($request->connectionId . time());
$pid = pcntl_fork();

if ($pid == -1) {
    echo json_encode(array(
        'status' => 500,
        'message' => 'Fork failure.',
    ));
} else if ($pid) {
    pcntl_waitpid(-1, $status);

    echo json_encode(array(
        'status' => 200,
        'message' => 'Connection stablished.',
        'connectionHash' => $hash,
        'pid' => $pid,
    ));

    exit();
} else {
    posix_setsid();
    chdir('/');
    umask(0);

    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
    socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

    if ($socket === false) {
        throw new Exception('Unable to create the socket.');
    }

    $startTime = time();
    socket_bind($socket, $address);
    socket_listen($socket);
    socket_set_nonblock($socket);

    $quit = false;
    $cmd = '';
    $clients = array();

    while ($quit === false) {
        if (($client = socket_accept($socket)) !== false) {
            $clients[] = $client;
            $json = socket_read($client, 100);

            $data = json_decode($json, true);
            $cmd = $data['command'];

            socket_write($client, json_encode(array(
                'data' => $data,
                'result' => 'OK',
                'time' => time(),
            )));
            socket_close($client);
        }

        if ($cmd) {
            if ($cmd === 'quit') {
                $quit = true;
            }

            $cmd = null;
        }

        if (time() - $startTime > 100) {
            $quit = true;
        }

        usleep(100);
    }

    socket_close($socket);
    @unlink($address);
}
