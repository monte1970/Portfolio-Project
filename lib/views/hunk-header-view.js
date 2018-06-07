import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class HunkHeaderView extends React.Component {
  static propTypes = {
    hunk: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    selectionMode: PropTypes.oneOf(['hunk', 'line']).isRequired,
  };

  render() {
    const conditional = {
      'is-selected': this.props.isSelected,
      'is-hunkMode': this.props.selectionMode === 'hunk',
    };

    return (
      <div className={cx('github-HunkHeaderView', conditional)}>
        <span className="github-HunkHeaderView-title">
          {this.props.hunk.getHeader().trim()} {this.props.hunk.getSectionHeading().trim()}
        </span>
      </div>
    );
  }
}
