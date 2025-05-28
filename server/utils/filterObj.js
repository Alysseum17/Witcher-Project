export default (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (el === '') return;
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
