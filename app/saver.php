<?php
$_POST = json_decode(file_get_contents("php://input"), true);
$file = fopen("diagrams/".$_POST['filename'], "w");
fwrite($file, $_POST['data']);
fclose($file);
?>