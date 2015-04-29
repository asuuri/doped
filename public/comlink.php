<?php
$limit = 10000;
$modTime = 0;
$previousModTime = 0;
$doPush = false;
$file = realpath(__DIR__) . '/../data.json';
$connectionId = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_STRING);
$watchdogCallBack = filter_input(INPUT_GET, 'watchdog', FILTER_SANITIZE_STRING);
$callBack = filter_input(INPUT_GET, 'callback', FILTER_SANITIZE_STRING);

var_dump($connectionId);
die;

if (!is_file($file)) {
    file_put_contents($file, '');
}

while($limit > 0):
    clearstatcache(true, $file);

    $modTime = filemtime($file);

    if ($previousModTime !== $modTime) {
        $jsonContent = file_get_contents($file);
        $previousModTime = $modTime;
        $doPush = true;
    }
    ?>
<script>
    if (typeof <?php echo $watchdogCallBack ?> === "function") {
        <?php echo $watchdogCallBack ?>();
    }
    <?php 
    if ($doPush): 
        $doPush = false; ?>
            
    if (typeof <?php echo $CallBack ?> === "function") {
        <?php echo $CallBack ?>(<?php echo $jsonContent; ?>);
    }
    
    <?php 
    endif; ?>
</script>



































<?php
    usleep(100000);
    $limit--;
    ob_flush();
    flush();
endwhile;
?>