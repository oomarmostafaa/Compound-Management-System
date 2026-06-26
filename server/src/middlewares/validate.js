// تفحص البيانات اللي جايه من المستخدم
function validate(rules, target = 'body') {
  return (req, res, next) => {
    const { error, value } = rules.validate(req[target], { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.details.map(d => d.message)
      });
    }

    req[target] = value;
    next();
  };
}

module.exports = validate;