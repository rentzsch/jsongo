# Changelog

## [0.6.6] - 2021-06-05

- FIX default --dataDir cli arg to "." ([rentzsch](https://github.com/rentzsch/jsongo/commit/af693a5697c09b75a09c6964e5cbfb75af423863))
- FIX allow semicolon-delimited multiple arguments in `jsongo eval --code`. This allows stuff like `jsongo eval --code 'db.deleteOne({id:42}); db.save()'` ([rentzsch](https://github.com/rentzsch/jsongo/commit/6f6e3a3e7811c77859b6b5fbe562a792fd330540))

## [0.6.5] - 2020-12-14

- Exclude fsDB from browser output files. ([alex996](https://github.com/rentzsch/jsongo/pull/15))

## [0.6.4] - 2020-11-24

- FIX Support pure number primary keys (`_id`). ([alex996](https://github.com/rentzsch/jsongo/pull/13))

## [0.6.3] - 2020-10-20

- NEW Export abstract DBProxy; FIX don't distribute test files ([alex996](https://github.com/rentzsch/jsongo/pull/12))

## [0.6.2] - 2020-10-01

- TypeScript rewrite (with breaking API changes) ([alex996](https://github.com/rentzsch/jsongo/pull/10))

## [0.3.0] - 2020-03-22

- Add Version History
- Add a README doc
- Add `test` to `.npmignore`
- Upgrade dependencies

## [0.2.0] - 2019-08-11

- Switch from Async to Sync
- Upgrade `sort-keys` from v2.0.0 to v3.0.0

## [0.1.1] - 2019-08-11

- Upgrade `ava` from v1.2.1 to v2.2.0
- Initial dev
