<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Controller</title>
        <script>
            dojoConfig= {
                async: true
            };
        </script>
        <script type="text/javascript" src="../js/dojo/dojo.js"></script>
        <script>
            require(
                ['dojo/parser', 'dojo/domReady!'], 
                function(parser) {
                    parser.parse();
                }
            );
        </script>
    </head>
    <body>
        <div data-dojo-type="doped/Controller"></div>
    </body>
</html>
