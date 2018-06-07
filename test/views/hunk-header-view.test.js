import React from 'react';
import {shallow} from 'enzyme';

import HunkHeaderView from '../../lib/views/hunk-header-view';
import Hunk from '../../lib/models/hunk';

describe('HunkHeaderView', function() {
  let atomEnv, hunk;

  beforeEach(function() {
    atomEnv = global.buildAtomEnvironment();
    hunk = new Hunk(0, 1, 10, 11, 'section heading', []);
  });

  afterEach(function() {
    atomEnv.destroy();
  });

  function buildApp(overrideProps = {}) {
    return (
      <HunkHeaderView
        hunk={hunk}
        isSelected={false}
        selectionMode={'hunk'}
        {...overrideProps}
      />
    );
  }

  it('applies a CSS class when selected', function() {
    const wrapper = shallow(buildApp({isSelected: true}));
    assert.isTrue(wrapper.find('.github-HunkHeaderView').hasClass('is-selected'));

    wrapper.setProps({isSelected: false});
    assert.isFalse(wrapper.find('.github-HunkHeaderView').hasClass('is-selected'));
  });

  it('applies a CSS class in hunk selection mode', function() {
    const wrapper = shallow(buildApp({selectionMode: 'hunk'}));
    assert.isTrue(wrapper.find('.github-HunkHeaderView').hasClass('is-hunkMode'));

    wrapper.setProps({selectionMode: 'line'});
    assert.isFalse(wrapper.find('.github-HunkHeaderView').hasClass('is-hunkMode'));
  });

  it('renders the hunk header title', function() {
    const wrapper = shallow(buildApp());
    assert.strictEqual(wrapper.find('.github-HunkHeaderView-title').text(), '@@ -0,10 +1,11 @@ section heading');
  });

  it('renders a button to stage the hunk');

  it('renders a button to stage selected lines');
});
