const generateRandomNumber = () => {
  let value = Math.floor(Math.random() * 100000000000000) + 90000000000000;
  return value;
};

module.exports = generateRandomNumber;
