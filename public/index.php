<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Presentation</title>
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
        <div data-dojo-type="doped/Presentation"></div>
    </body>
</html>
