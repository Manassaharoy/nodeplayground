const chalk = require("chalk");

function coloredLog(messages, color) {
  let messageStr;

  if (Array.isArray(messages)) {
    messageStr = messages.join(' ');;
  } else {
    messageStr = messages;
  }

  switch (color) {
    case 1:
      console.log(chalk.red(messageStr));
      break;
    case 2:
      console.log(chalk.green(messageStr));
      break;
    case 3:
      console.log(chalk.blue(messageStr));
      break;
    case 4:
      console.log(chalk.yellow(messageStr));
      break;
    case 5:
      console.log(chalk.cyan(messageStr));
      break;
    case 6:
      console.log(chalk.magenta(messageStr));
      break;

    default:
      console.log(chalk.white(messageStr));
      break;
  }
}

module.exports = { coloredLog };
