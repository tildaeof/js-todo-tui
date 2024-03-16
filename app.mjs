#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import { promises as fs } from 'fs';

const tasksFilePath = './tasks.json';

async function loadTasks() {
  try {
    const data = await fs.readFile(tasksFilePath, { encoding: 'utf8' });
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return an empty array
      return [];
    } else {
      throw error;
    }
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), { encoding: 'utf8' });
}

async function displayTasks() {
  const tasks = await loadTasks();
  console.log(chalk.blue('Your tasks:'));
  tasks.forEach((task, index) => {
    console.log(chalk.green(`${index + 1}. ${task.description} - ${task.done ? 'Done' : 'Not Done'}`));
  });
}

async function addTask() {
  const tasks = await loadTasks();
  inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Task description:',
    }
  ]).then(async answers => {
    tasks.push({ description: answers.description, done: false });
    await saveTasks(tasks);
    console.log(chalk.yellow('Task added!'));
    main();
  });
}

async function markTaskAsDone() {
  const tasks = await loadTasks();
  inquirer.prompt([
    {
      type: 'input',
      name: 'taskIndex',
      message: 'Enter task number to mark as done:',
      validate: input => {
        const index = parseInt(input) - 1;
        return index >= 0 && index < tasks.length ? true : 'Invalid task number';
      }
    }
  ]).then(async answers => {
    const index = parseInt(answers.taskIndex) - 1;
    tasks[index].done = true;
    await saveTasks(tasks);
    console.log(chalk.yellow('Task marked as done!'));
    main();
  });
}

async function deleteTask() {
  const tasks = await loadTasks();
  inquirer.prompt([
    {
      type: 'input',
      name: 'taskIndex',
      message: 'Enter task number to delete:',
      validate: input => {
        const index = parseInt(input) - 1;
        return index >= 0 && index < tasks.length ? true : 'Invalid task number';
      }
    }
  ]).then(async answers => {
    const index = parseInt(answers.taskIndex) - 1;
    tasks.splice(index, 1);
    await saveTasks(tasks);
    console.log(chalk.yellow('Task deleted!'));
    main();
  });
}

async function main() {
  await displayTasks();
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action:',
      choices: ['Add Task', 'Mark Task As Done', 'Delete Task', 'Exit']
    }
  ]).then(async answers => {
    switch (answers.action) {
      case 'Add Task':
        await addTask();
        break;
      case 'Mark Task As Done':
        await markTaskAsDone();
        break;
      case 'Delete Task':
        await deleteTask();
        break;
      case 'Exit':
        console.log(chalk.blue('Goodbye!'));
        process.exit();
    }
  });
}

main();
