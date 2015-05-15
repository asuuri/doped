<?php
header('Content-Type: application/json');

$slides = glob(__DIR__ . '/*.svg');

foreach ($slides as $index => $slide) {
    $slides[$index] = str_replace('//', '/', $_SERVER['REQUEST_URI'] . '/' . basename($slide));
}

$data = array(
    'total' => count($slides),
    'slides' => $slides
);

echo json_encode($data);