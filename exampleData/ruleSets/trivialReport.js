exports.name = 'Test rule';
exports.description = 'An empty test rule';

exports.rule = function(report) {
  report.error('test error', null);
};
