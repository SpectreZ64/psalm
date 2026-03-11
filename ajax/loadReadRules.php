<?php
/**
 * Загрузка правил чтения
 * 
 * Файлы с правилами размещены по пути /data/rules/[name].json
 */

if (!isset($postData['ruleName'])) return;
$filePath = $_SERVER['DOCUMENT_ROOT'] . '/data/rules/' . $postData['ruleName'] . '.json'; // Путь к файлу с правилами

if (!file_exists($filePath)) {
    sendResponse(false, 'Rule not found.');
}

sendResponse(true, json_decode(file_get_contents($filePath), true));