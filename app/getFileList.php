<?php
$data = scandir("diagrams/");
$data = array_splice($data, 2, count($data)-2);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);