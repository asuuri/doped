<?php

define('MODE_RECEIVER', 'rx');
define('MODE_TRANSMITTER', 'tx');

$connectionId = filter_input(INPUT_GET, 'connectionId');
$callback = filter_input(INPUT_GET, 'callback');
$watchdogCallBack = filter_input(INPUT_GET, 'watchdog');
$wdTimeout = filter_input(INPUT_GET, 'wdto');

if (!$connectionId) {
    throw new Exception('Connection "id" is not set!');
}

if (!$wdTimeout) {
    $wdTimeout = 10;
}

$address = '/tmp/doped-rx_' . $connectionId . '.socket';

if ($_GET['mode'] === MODE_TRANSMITTER) {
    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
    socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);
            
    if ($socket) {
        socket_bind($socket, $address);
        socket_listen($socket);
        socket_set_nonblock($socket);
        $quit = false;
        $cmd = '';
        $time = 0;

        while ($quit === false) {
            if (($client = socket_accept($socket)) !== false) {
                $json = socket_read($client, 100);

                $data = json_decode($json, true);
                $cmd = $data['cmd'];
                
                socket_write($client, json_encode(array(
                    'data' => $data,
                    'result' => 'OK',
                    'time' => time(),
                )));
                socket_close($client);
            }
            
            if ($cmd) {
                echo sprintf("<p>%s</p>\n", $cmd);
                if ($callback) {?>
<script>
    if (window.parent && window.parent.hasOwnProperty('<?php echo $callback; ?>')) {
        window.parent.<?php echo $callback; ?>('<?php echo $cmd; ?>');
    }
</script>
                <?php
                }
                
                if ($cmd === 'quit') {
                    $quit = true;
                }
                
                ob_flush();
                flush();
                $cmd = null;
            }
            
            if ((time() - $time) > $wdTimeout && $watchdogCallBack) {
                $time = time();
                echo "<p>Whatchdog!</p>\n"; ?>
<script>
    if (window.parent && typeof window.parent.<?php echo $watchdogCallBack; ?> === 'function') {
        window.parent.<?php echo $watchdogCallBack; ?>();
    }
</script>

<?php
                ob_flush();
                flush();
            }
            
            usleep(100);
        }
        
        socket_close($socket);
        unlink($address);
    }
} else if ($_GET['mode'] === MODE_RECEIVER) {
    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
    
    if (socket_connect($socket, $address)) {
        $cmd = filter_var($_GET['cmd'], FILTER_SANITIZE_STRING);
        
        $data = array(
            'cmd' => $cmd,
        );
        $sent = socket_write($socket, json_encode($data));
        
        echo socket_read($socket, 100);
    }

    socket_close($socket);
}

