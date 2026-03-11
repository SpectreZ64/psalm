<?php
/**
 * Загрузка текста из файлов
 */

if (!isset($postData['filePaths'])) return;
$filePaths = $postData['filePaths']; // Пути к файлам с текстом относительно папки data

$text = '';
foreach ($filePaths as $filePath) {
    if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/data/' . $filePath)) continue;
    $text .= file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/data/' . $filePath);
}

sendResponse(true, $text);