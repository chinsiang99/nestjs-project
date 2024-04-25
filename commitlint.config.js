module.exports = {
    rules: {
        'body-case': [2, 'always', 'lower-case'],
        'type-enum': [2, 'always', [
            'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'ci', 'chore', 'revert', 'WIP'
        ]],
        'subject-full-stop': [2, 'never'],
        'subject-empty': [2, 'never'],
        'header-max-length': [2, 'always', 1000],
    }
};

