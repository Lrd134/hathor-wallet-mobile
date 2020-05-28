/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { t } from 'ttag';
import FeedbackModal from './FeedbackModal';
import Spinner from '../components/Spinner';
import { MIN_JOB_ESTIMATION } from '../constants';
import checkIcon from '../assets/images/icCheckBig.png';
import errorIcon from '../assets/images/icErrorBig.png';
import {
  Image
} from 'react-native';
import PropTypes from 'prop-types';

class SendTransactionFeedbackModal extends React.Component {
  /**
   * errorMessage {string} Message to be shown to the user in case of error in the form
   */
  state = {
    miningEstimation: null,
    jobID: null,
    jobDone: false,
    success: false,
    sending: true,
    errorMessage: '',
  }

  componentDidMount = () => {
    this.addSendTxEventHandlers();
    this.props.sendTransaction.start();
  }

  addSendTxEventHandlers = () => {
    this.props.sendTransaction.on('job-submitted', this.updateEstimation);
    this.props.sendTransaction.on('estimation-updated', this.updateEstimation);
    this.props.sendTransaction.on('job-done', this.jobDone);
    this.props.sendTransaction.on('tx-sent', this.txSent);
  }

  txSent = (response) => {
    this.setState({ sending: false, success: response.success, errorMessage: response.message });
    if (response.success) {
      this.props.onTxSuccess && this.props.onTxSuccess(response);
    } else {
      this.props.onTxError && this.props.onTxError(response);
    }
  }

  jobDone = (data) => {
    this.setState({ miningEstimation: null, jobDone: true });
  }

  updateEstimation = (data) => {
    this.setState({ miningEstimation: data.estimation });
  }

  render() {
    const renderModal = () => {
      if (this.state.sending) {
        return (
          <FeedbackModal
            text={getSendingModalText()}
            icon={<Spinner />}
          />
        );
      } else if (this.state.success) {
        return (
          <FeedbackModal
            icon={<Image source={checkIcon} style={{ height: 105, width: 105 }} resizeMode='contain' />}
            text={this.props.successText}
            onDismiss={() => {this.props.onDismissSuccess && this.props.onDismissSuccess()}}
          />
        );
      } else {
        return (
          <FeedbackModal
            icon={<Image source={errorIcon} style={{ height: 105, width: 105 }} resizeMode='contain' />}
            text={this.state.errorMessage}
            onDismiss={() => {this.props.onDismissError && this.props.onDismissError()}}
          />
        );
      }
    }

    const getSendingModalText = () => {
      let secondaryText = '';
      if (this.state.jobDone) {
        secondaryText = t`Propagating transaction to the network.`;
      } else if (this.state.miningEstimation) {
        const estimation = Math.max(Math.ceil(this.state.miningEstimation), MIN_JOB_ESTIMATION);
        secondaryText = t`Estimated time: ${estimation}s`;
      }
      return `${this.props.text}\n\n${secondaryText}`;
    }

    return renderModal();
  }
}

SendTransactionFeedbackModal.propTypes = {
  // Text displayed on the modal
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  // sendTransaction object
  // TODO add other proptypes
};

export default SendTransactionFeedbackModal;