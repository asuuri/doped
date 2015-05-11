<html>
    <head></head>
    <body>
<?php

$callBack = $_GET['connectionNode'];
for($i = 0; $i < 5; $i++): ?>

<p>Script #<?php echo $i; ?></p>
<script>
    if (window.parent && window.parent.hasOwnProperty('<?php echo $callBack; ?>')) {
        window.parent.<?php echo $callBack; ?>.message(<?php echo $i; ?>);
    }
</script>


<?php
    usleep(10000);
    ob_flush();
    flush();
endfor; ?>
    </body>
</html>