<html>
    <head></head>
    <body>
<?php

$callBack = $_GET['callback'];
for($i = 0; $i < 5; $i++): ?>

    <p>Script #<?php echo $i; ?></p>
<script>
    if (window.parent.hasOwnProperty('<?php echo $callBack; ?>')) {
        window.parent.<?php echo $callBack ?>(<?php echo $i; ?>);
    }
</script>











<?php
    sleep(0.2);
    ob_flush();
    flush();
endfor; ?>
    </body>
</html>