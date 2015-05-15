<?php

define('MODE_CLIENT', 'client');
define('MODE_CONTROLLER', 'controller');
define('INPUT_FILTER', FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);

ob_implicit_flush(true);
set_time_limit(0);

$request = (object) filter_input_array(
    INPUT_GET,
    array(
        'connectionId' => INPUT_FILTER,
        'connectionNode' => INPUT_FILTER,
        'mode' => INPUT_FILTER,
        'command' => INPUT_FILTER,
    ),
    true
);

if ($request->connectionId) {
    $address = '/var/www/sockets/doped-' . $request->connectionId . '.socket';

    if ($request->mode === MODE_CONTROLLER) {
        header('Content-Type: application/json');
        $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);

        if (@socket_connect($socket, $address)) {
            $data = array(
                'command' => $request->command,
            );

            $sent = socket_write($socket, json_encode($data) . "\n");

            echo socket_read($socket, 500, PHP_NORMAL_READ);
        } else {
            echo json_encode(array(
                'status' => 500,
                'message' => 'Unable to connect.',
            ));
        }

        socket_close($socket);
        exit();
    } else if ($request->mode === MODE_CLIENT) {
        $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);

        if ($socket === false) {
            throw new Exception('Unable to create the socket.');
        }

        echo 'Connecting...';
        if (@socket_connect($socket, $address)) {
            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, array('sec' => 0, 'usec' => 1000));
            $sent = socket_write($socket, json_encode(array('command' => '')) . "\n");

            $quit = false;
            $cmd = '';
            $time = 0;

?>
<p>Connection <?php echo $request->connectionId; ?> ready!</p>
<script>
if (window.parent && window.parent.hasOwnProperty('<?php echo $request->connectionNode; ?>')) {
    window.parent.<?php echo $request->connectionNode; ?>.ready(window);
}
</script>

<?php
            ob_flush();
            flush();

            while ($quit === false) {
                $json = socket_read($socket, 100);
                $data = json_decode($json, true);

                if (isset($data['command'])) {
                    $cmd = $data['command'];
                    echo sprintf("<p>%s</p>\n", $cmd);?>
<script>
if (window.parent && window.parent.hasOwnProperty('<?php echo $request->connectionNode; ?>')) {
    window.parent.<?php echo $request->connectionNode; ?>.message('<?php echo $cmd; ?>');
}
</script> <?php

                    if ($cmd === 'quit') {
                        $quit = true;
                    }

                    ob_flush();
                    flush();
                    $cmd = null;
                }

                if ((time() - $time) > 10) {
                    $time = time();
                    echo "<p>Bark!</p>\n"; ?>
<script>
if (window.parent && window.parent.hasOwnProperty('<?php echo $request->connectionNode; ?>')) {
    window.parent.<?php echo $request->connectionNode; ?>.watchdog();
}
</script>

    <?php
                    ob_flush();
                    flush();
                }

                usleep(100);
            }

            socket_close($socket);
            @unlink($address);
        } else {
            echo json_encode(array(
                'status' => 500,
                'message' => 'Unable to connect',
            ));
        }
    } else {
        echo json_encode(array(
            'status' => 400,
            'message' => 'Unknown mode value.',
        ));
    }
} else {
    header('Content-Type: application/json');
    $address = '/var/www/sockets/doped.socket';

    if (!$request->command) {
        $request->command = 'create';
    }

    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);

    if (@socket_connect($socket, $address)) {

        $data = array('command' => $request->command);

        $sent = socket_write($socket, json_encode($data));

        echo socket_read($socket, 500, PHP_NORMAL_READ);
    } else {
        echo json_encode(array(
            'status' => 500,
            'message' => 'Unable to connect.',
        ));
    }
}