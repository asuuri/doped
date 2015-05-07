<?php

define('SLIDES_MODE', 'slides');
define('COMMANDER_MODE', 'commander');
$get = filter_input_array(INPUT_GET);

if (!isset($get['id']) && 
    !in_array($get['mode'], array(SLIDES_MODE, COMMANDER_MODE))) {
    return;
}

$mode = $get['mode'];
$address = sprintf("/tmp/doped-%s.socket", $get['id']);
$socket = socket_create(AF_UNIX, SOCK_STREAM, 0);

if ($socket) {
    if ($mode === COMMANDER_MODE && socket_connect($socket, $address)) {

        socket_write($socket, 'FooBar');
        socket_close($socket);

    } else if (socket_bind($socket, $address)) {
        socket_listen($socket);
        
        if (($client = socket_accept($socket)) !== false) {
            var_dump(socket_read($client, 40));
        }

        socket_close($socket);
        unlink($address);
    }
}

