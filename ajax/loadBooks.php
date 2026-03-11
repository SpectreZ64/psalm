<?php
/**
 * Загрузка данных о структуре Псалтири и имеющихся в приложении "книгах" - наборах молитв
 */

if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/data/kathisma-structure.json')) return false;
$structure = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/data/kathisma-structure.json'), true); // Структура кафизм Псалтири

if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/data/prayer-book.json')) return false;
$prayers = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/data/prayer-book.json'), true); // Список молитвенных правил

sendResponse(true, [
    'kathismaStructure' => $structure,
    'prayerBook' => $prayers
]);