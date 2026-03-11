<?php
/**
 * Загрузка текста молитв
 * 
 * Возвращает молитвы для кафизмы в виде массива 1 - перед кафизмой, 2 - после первой части, 3 - после второй части, 4 - после третей части. Пути к файлам с текстом молитв формируются следующим образом: /data/prayers/[index]/[lang]/(1-4).html
 */

if (!isset($postData['index'])) return;
if (!isset($postData['lang'])) return;
$index = $postData['index']; // Идентификатор набора молитв (указывается в файле правил, параметр prayers)
$lang = $postData['lang']; // Язык текста

$result = [
    '1' => '',
    '2' => '',
    '3' => '',
    '4' => ''
];

foreach ($result as $i => &$val) {
    $val = $_SERVER['DOCUMENT_ROOT'] . '/data/prayers/' . $index . '/' . $lang . '/' . $i . '.html';
    if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/data/prayers/' . $index . '/' . $lang . '/' . $i . '.html')) continue;
    $val = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/data/prayers/' . $index . '/' . $lang . '/' . $i . '.html');
    unset($val);
}

sendResponse(true, $result);