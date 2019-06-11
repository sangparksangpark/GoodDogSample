import React from "react";
import * as commentsService from "../../services/commentsService";
import "../../styles/comments.css";
import Reply from "../Comments/Reply";

class RepliesMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      replies: [],
      entityTypeId: this.props.comment.entityTypeId,
      entityId: this.props.comment.entityId,
      parentCommentId: this.props.comment.id,
      id: 0,
      title: "",
      body: "",
      pageSize: this.props.comment.cnt
    };
  }

  componentDidMount() {
    this.getPageData(0, this.state.pageSize, this.state.parentCommentId)
      .then(response => {
        let replies = response.data.item.pagedItems;
        this.setState({ replies: replies });
      })
      .catch(this.onGetPagedError);
  }

  getPageData(pageIndex, pageSize, parentId) {
    return commentsService.getPagedByEntity(
      pageIndex,
      pageSize,
      this.state.entityTypeId,
      this.state.entityId,
      parentId
    );
  }

  onGetPagedSuccess = response => {
    this.setState({
      replies: response.data.item.pagedItems
    });
    console.log(response.data.item.pagedItems);
  };
  onGetPagedError = response => {
    console.log(response);
  };

  submitReplyHandler = (reply, comment) => {
    comment.userId = this.props.currentUser.id;
    comment.photoUrl = this.props.currentUser.photoUrl;
    let replies = comment.replies;
    if (replies === undefined) {
      comment.replies = [reply];
    } else {
      comment.replies = [reply, ...replies];
    }
    this.setState({
      replies: comment.replies
    });
    this.resetForm();
    this.renderNewReplies();
  };
  renderNewReplies = () => {
    console.log("parent");
  };

  deleteReplyHandler = (e, comment) => {
    e.preventDefault();
    commentsService
      .deleteComment(comment.id)
      .then(() => {
        let replies = [...this.state.replies];
        let newReplies = replies.filter(object => object.id !== comment.id);
        this.setState({ replies: [...newReplies] }, () =>
          console.log("testpage2.deletecomment - replies", this.state)
        );
        this.props.subtractReplyCount();
      })
      .catch(console.log("delete Error"));
  };
  handleNewReplyChange = evt => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  };

  openForm = () => {
    this.setState({
      isFormOpen: !this.state.isFormOpen
    });
  };

  resetForm = () => {
    this.setState({
      id: 0,
      newBody: ""
      //title: "",
    });
  };

  mapReplies = aReply => {
    return (
      <Reply
        {...this.props}
        comment={aReply}
        deleteReplyHandler={this.deleteReplyHandler}
        submitReply={this.submitReplyHandler}
        replies={this.state.replies}
        key={aReply.id}
      />
    );
  };

  render() {
    return (
      <div>
        <div className="card">{this.state.replies.map(this.mapReplies)}</div>
      </div>
    );
  }
}
export default RepliesMap;
