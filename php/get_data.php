<?php
$first = true;
$credentials = json_decode(file_get_contents("../.credentials"),true);

start:
$mysqli = new mysqli("127.0.0.1", $credentials["sql"]["username"], $credentials["sql"]["password"], $credentials["sql"]["database"]);
if ($mysqli->connect_errno) {
    die("Failed to connect to MySQL: " . $mysqli->connect_error);
}

$res = $mysqli->query('SELECT * FROM data ORDER BY date DESC LIMIT 1');
$row = $res->fetch_assoc();

$today = date('Y-m-d');

if(isset($_GET['debug'])) {
    echo "\$today: $today<br>\$retrieved date: {$row['date']}<br>timezone: ".date_default_timezone_get()."<br>";
}

if($row['date'] != $today) {
    $output = `python ../python/updatedb.py`;
    if(isset($_GET['debug'])) {
        echo "\$output: $output<br>";
    }
    if($first) {
        $first = false;
        goto start;
    }
}

$info = [
    'data' => floatval($row['data']),
    'days_left' => intval($row['days_left'])
];

echo json_encode($info);