#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const CONFIG = {
  FIGMA_FILE_ID: process.env.FIGMA_FILE_ID,
  FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN,
  FIGMA_PAGE_NAME: 'Icons', // Название страницы с иконками
  OUTPUT_DIR: path.join(__dirname, '..', 'src', 'icons'),
  FIGMA_API_BASE: 'https://api.figma.com/v1'
};

// Проверка переменных окружения
if (!CONFIG.FIGMA_FILE_ID || !CONFIG.FIGMA_ACCESS_TOKEN) {
  console.error('❌ Ошибка: Необходимо установить FIGMA_FILE_ID и FIGMA_ACCESS_TOKEN');
  process.exit(1);
}

/**
 * Получить данные файла из Figma
 */
async function getFigmaFile() {
  const url = `${CONFIG.FIGMA_API_BASE}/files/${CONFIG.FIGMA_FILE_ID}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': CONFIG.FIGMA_ACCESS_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Ошибка при получении файла из Figma:', error.message);
    throw error;
  }
}

/**
 * Найти страницу с иконками
 */
function findIconsPage(document) {
  const iconsPage = document.children.find(page => 
    page.name === CONFIG.FIGMA_PAGE_NAME
  );

  if (!iconsPage) {
    throw new Error(`Страница "${CONFIG.FIGMA_PAGE_NAME}" не найдена`);
  }

  return iconsPage;
}

/**
 * Рекурсивно найти все узлы с иконками
 */
function findIconNodes(node, icons = []) {
  // Если узел имеет тип, который может содержать иконку
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'FRAME') {
    // Проверяем, является ли это иконкой (обычно это компоненты или фреймы)
    if (node.name && !node.name.startsWith('_') && !node.name.includes(' ')) {
      icons.push(node);
    }
  }

  // Рекурсивно обходим дочерние узлы
  if (node.children) {
    for (const child of node.children) {
      findIconNodes(child, icons);
    }
  }

  return icons;
}

/**
 * Экспортировать узел как SVG
 */
async function exportNodeAsSVG(nodeId) {
  const url = `${CONFIG.FIGMA_API_BASE}/images/${CONFIG.FIGMA_FILE_ID}`;
  
  const params = new URLSearchParams({
    ids: nodeId,
    format: 'svg',
    scale: '1'
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      headers: {
        'X-Figma-Token': CONFIG.FIGMA_ACCESS_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.images[nodeId];
  } catch (error) {
    console.error(`❌ Ошибка при экспорте узла ${nodeId}:`, error.message);
    throw error;
  }
}

/**
 * Скачать SVG и сохранить в файл
 */
async function downloadAndSaveSVG(svgUrl, fileName) {
  try {
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const svgContent = await response.text();
    const filePath = path.join(CONFIG.OUTPUT_DIR, `${fileName}.svg`);
    
    await fs.writeFile(filePath, svgContent, 'utf8');
    console.log(`✅ Экспортирован: ${fileName}.svg`);
    
    return filePath;
  } catch (error) {
    console.error(`❌ Ошибка при сохранении ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Основная функция экспорта
 */
async function exportIcons() {
  console.log('🚀 Начинаем экспорт иконок из Figma...');
  
  try {
    // Создаем папку назначения
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    
    // Получаем данные файла
    console.log('📥 Получаем данные файла из Figma...');
    const figmaData = await getFigmaFile();
    
    // Находим страницу с иконками
    console.log(`🔍 Ищем страницу "${CONFIG.FIGMA_PAGE_NAME}"...`);
    const iconsPage = findIconsPage(figmaData.document);
    
    // Находим все узлы с иконками
    console.log('🎯 Ищем узлы с иконками...');
    const iconNodes = findIconNodes(iconsPage);
    
    if (iconNodes.length === 0) {
      console.log('⚠️  Иконки не найдены');
      return;
    }
    
    console.log(`📊 Найдено ${iconNodes.length} иконок`);
    
    // Экспортируем каждую иконку
    const exportedFiles = [];
    
    for (const node of iconNodes) {
      try {
        console.log(`🔄 Экспортируем: ${node.name}`);
        
        // Получаем URL для экспорта
        const svgUrl = await exportNodeAsSVG(node.id);
        
        if (!svgUrl) {
          console.warn(`⚠️  Не удалось получить URL для ${node.name}`);
          continue;
        }
        
        // Скачиваем и сохраняем SVG
        const fileName = node.name.replace(/[^a-zA-Z0-9-_]/g, '_'); // Очищаем имя файла
        const filePath = await downloadAndSaveSVG(svgUrl, fileName);
        exportedFiles.push(filePath);
        
      } catch (error) {
        console.error(`❌ Ошибка при экспорте ${node.name}:`, error.message);
      }
    }
    
    console.log(`✅ Экспорт завершен! Создано ${exportedFiles.length} файлов`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск экспорта
exportIcons();
