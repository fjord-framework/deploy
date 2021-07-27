const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const FjordApp = require('../lib/fjord_app-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FjordApp.FjordAppStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
