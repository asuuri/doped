<?php

define('MODE_RECEIVER', 'rx');
define('MODE_TRANSMITTER', 'tx');
define('INPUT_FILTER', FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);

$options = filter_input_array(
    INPUT_GET,
    array(
        'connectionId' => INPUT_FILTER,
        'connectionNode' => INPUT_FILTER,
        'ttl' => INPUT_FILTER,
        'mode' => INPUT_FILTER,
        'cmd' => INPUT_FILTER,
        'watchdogTimeout' => FILTER_SANITIZE_NUMBER_INT,
    )
);

$callback = filter_input(INPUT_GET, 'callback');
$watchdogCallBack = filter_input(INPUT_GET, 'watchdog');
$ttl = filter_input(INPUT_GET, 'ttl');
$connectedCallback = filter_input(INPUT_GET, 'connected');

if (!$options['connectionId']) {
    throw new Exception('Connection "id" is not set!');
}

if (!$options['watchdogTimeout']) {
    $options['watchdogTimeout'] = 10;
}

if (!$options['ttl']) {
    $options['ttl'] = 5;
}

$address = '/tmp/doped-rx_' . $options['connectionId'] . '.socket';

if ($options['mode'] === MODE_TRANSMITTER) {
    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);

    if ($socket === false) {
        throw new Exception('Unable to create the socket.');
    }

    //socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

    socket_bind($socket, $address);
    socket_listen($socket);
    socket_set_nonblock($socket);

    $quit = false;
    $cmd = '';
    $time = 0;
    $startTime = time();

    ?>
<p>Connection <?php echo $options['connectionId']; ?> ready!</p>
<script>
    if (window.parent && window.parent.hasOwnProperty('<?php echo $options['connectionNode']; ?>')) {
        window.parent.<?php echo $options['connectionNode']; ?>.ready(window);
    }
</script>

<?php
    ob_flush();
    flush();

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
            echo sprintf("<p>%s</p>\n", $cmd);?>
<script>
    if (window.parent && window.parent.hasOwnProperty('<?php echo $options['connectionNode']; ?>')) {
        window.parent.<?php echo $options['connectionNode']; ?>.message('<?php echo $cmd; ?>');
    }
</script> <?php

            if ($cmd === 'quit') {
                $quit = true;
            }

            ob_flush();
            flush();
            $cmd = null;
        }

        if ((time() - $time) > $options['watchdogTimeout']) {
            $time = time();
            echo "<p>Bark!</p>\n"; ?>
<script>
    if (window.parent && window.parent.hasOwnProperty('<?php echo $options['connectionNode']; ?>')) {
        window.parent.<?php echo $options['connectionNode']; ?>.watchdog();
    }
</script>

<?php
            ob_flush();
            flush();
        }

        if (time() - $startTime > $ttl) {
            $quit = true;
            echo '<p>Timeout!</p>';
            ob_flush();
            flush();
        }

        usleep(100);
    }

    socket_close($socket);
    @unlink($address);
} else if ($options['mode'] === MODE_RECEIVER) {
    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);

    if (socket_connect($socket, $address)) {
        $cmd = $options['cmd'];

        $data = array(
            'cmd' => $cmd,
        );
        $sent = socket_write($socket, json_encode($data));

        echo socket_read($socket, 100);
    }

    socket_close($socket);
}

