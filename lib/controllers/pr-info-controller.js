import React from 'react';
import PropTypes from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';

import {RemotePropType, BranchSetPropType} from '../prop-types';
import PrSelectionByUrlContainer from '../containers/pr-selection-by-url-container';
import PrSelectionByBranchContainer from '../containers/pr-selection-by-branch-container';
import GithubLoginView from '../views/github-login-view';
import RelayNetworkLayerManager from '../relay-network-layer-manager';
import {UNAUTHENTICATED} from '../shared/keytar-strategy';
import {autobind} from '../helpers';

export default class PrInfoController extends React.Component {
  static propTypes = {
    token: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.symbol,
    ]).isRequired,
    host: PropTypes.string.isRequired,
    selectedPrUrl: PropTypes.string,
    branches: BranchSetPropType.isRequired,
    remote: RemotePropType.isRequired,
    aheadCount: PropTypes.number,
    pushInProgress: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    onSelectPr: PropTypes.func.isRequired,
    onUnpinPr: PropTypes.func.isRequired,
    onCreatePr: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    autobind(this, 'renderLoading', 'renderSpecificPrFailure', 'renderFailure');
  }

  render() {
    if (this.props.token === UNAUTHENTICATED) {
      return null;
    }

    if (this.props.selectedPrUrl) {
      return this.renderSpecificPr();
    } else {
      return this.renderPrByBranchName();
    }
  }

  renderSpecificPr() {
    const {token, host} = this.props;

    const environment = RelayNetworkLayerManager.getEnvironmentForHost(host, token);
    const variables = {
      prUrl: this.props.selectedPrUrl,
    };

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query prInfoControllerByUrlQuery($prUrl: URI!) {
            resource(url: $prUrl) {
              ...prSelectionByUrlContainer_resource
            }
          }
        `}
        variables={variables}
        render={({error, props, retry}) => {
          if (error) {
            return this.renderSpecificPrFailure(error, retry);
          } else if (props) {
            return (
              <PrSelectionByUrlContainer
                {...props}
                variables={variables}
                onSelectPr={this.props.onSelectPr}
                onUnpinPr={this.props.onUnpinPr}
              />
            );
          } else {
            return this.renderLoading();
          }
        }}
      />
    );
  }

  renderPrByBranchName() {
    const {token, host} = this.props;

    const environment = RelayNetworkLayerManager.getEnvironmentForHost(host, token);
    const variables = {
      repoOwner: this.props.remote.getOwner(),
      repoName: this.props.remote.getRepo(),
      branchName: this.props.branches.getHeadBranch().getName(),
    };
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query prInfoControllerByBranchQuery(
            $repoOwner: String!, $repoName: String!, $branchName: String!
          ) {
            repository(owner: $repoOwner, name: $repoName) {
              ...prSelectionByBranchContainer_repository
            }
          }
        `}
        variables={variables}
        render={({error, props, retry}) => {
          if (error) {
            return this.renderSpecificPrFailure(error, retry);
          } else if (props) {
            return (
              <PrSelectionByBranchContainer
                {...props}
                variables={variables}
                onSelectPr={this.props.onSelectPr}
                onUnpinPr={this.props.onUnpinPr}
                onCreatePr={this.props.onCreatePr}
                onSearchAgain={retry}
                remote={this.props.remote}
                aheadCount={this.props.aheadCount}
                branches={this.props.branches}
                pushInProgress={this.props.pushInProgress}
              />
            );
          } else {
            return this.renderLoading();
          }
        }}
      />
    );
  }

  renderLoading() {
    return (
      <div className="github-Loader">
        <span className="github-Spinner" />
      </div>
    );
  }

  renderSpecificPrFailure(err, retry) {
    if (this.isNotFoundError(err)) {
      return (
        <PrSelectionByUrlContainer
          prUrl={this.props.selectedPrUrl}
          query={null}
          onSelectPr={this.props.onSelectPr}
          onUnpinPr={this.props.onUnpinPr}
        />
      );
    } else {
      return this.renderFailure(err, retry);
    }
  }

  renderFailure(err, retry) {
    if (err.response && err.response.status === 401) {
      return (
        <div className="github-GithubLoginView-Container">
          <GithubLoginView onLogin={this.props.onLogin}>
            <p>
              The API endpoint returned a unauthorized error. Please try to re-authenticate with the endpoint.
            </p>
          </GithubLoginView>
        </div>
      );
    } else {
      return (
        <div className="github-Message">
          <div className="github-Message-wrapper">
            <h1 className="github-Message-title">Error</h1>
            <p className="github-Message-description">
              An unknown error occurred
            </p>
            <div className="github-Message-action">
              <button className="github-Message-button btn btn-primary" onClick={retry}>Try Again</button>
              <button className="github-Message-button btn" onClick={this.props.onLogout}>Logout</button>
            </div>
          </div>
        </div>
      );
    }
  }

  isNotFoundError(err) {
    return err.source &&
      err.source.errors &&
      err.source.errors[0] &&
      err.source.errors[0].type === 'NOT_FOUND';
  }
}
