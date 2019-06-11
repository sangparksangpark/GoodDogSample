import React from "react";
import * as commentsService from "../../services/commentsService";
import "../../styles/comments.css";
import Moment from "react-moment";
import RepliesMap from "../Comments/RepliesMap";

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reply: [],
      replies: [],
      entityTypeId: this.props.entityTypeId,
      entityId: this.props.entityId,
      parentCommentId: 0,
      id: 0,
      title: "",
      body: "",
      editFormIsOpen: false,
      isOpen: false,
      dropdownId: 0,
      totalCount: 0,
      toggleReplies: false,
      viewReplies: false,
      commentCount: this.props.comment.cnt,
      admin: false
    };
  }

  componentDidMount() {
    this.getCommentsLength(this.props.entityTypeId, this.props.entityId, 0)
      .then(this.onGetCommentsLengthSuccess)
      .catch(this.onGetCommentsLengthError);
    this.isAdmin(this.props.currentUser.roles[0]);
  }
  isAdmin = role => {
    if (role === "Admin") {
      this.setState({ admin: true }, () =>
        console.log("admin", this.state.admin)
      );
    }
  };

  getCommentsLength = (entityTypeId, entityId, parentId) => {
    return commentsService.getAllByEntity(entityTypeId, entityId, parentId);
  };
  onGetCommentsLengthSuccess = response => {
    this.setState({ totalCount: response.data.items.length });
  };
  onGetCommentsLengthError = response => {
    console.log(response);
  };

  submitReplyHandler = (e, comment) => {
    e.preventDefault();
    let reply = {
      title: this.state.title,
      body: this.state.body,
      parentCommentId: this.state.parentCommentId,
      entityTypeId: this.state.entityTypeId,
      entityId: this.state.entityId
    };
    commentsService
      .submitReply(reply)
      .then(response => {
        reply.userId = this.props.currentUser.id;
        reply.id = response.data.item;
        reply.photoUrl = this.props.currentUser.photoUrl;
        //comment.reply = [reply];
        comment.cnt = comment.cnt + 1;
        let replies = comment.reply;
        if (replies === undefined) {
          comment.reply = [reply];
        } else {
          comment.reply = [reply, ...replies];
        }
        this.resetForm();
        this.setState({
          reply: comment.reply,
          viewReplies: true
        });
      })
      .catch(console.log("Submit Reply Error"));
  };

  handleChange = (evt, comment) => {
    this.setState({ [evt.target.name]: evt.target.value });
  };

  renderReplyForm = comment => {
    return (
      <div className="media">
        {" "}
        <img
          className="mr-3 rounded-circle thumb32"
          src={
            this.props.currentUser.photoUrl === null
              ? "https://i.imgur.com/l15inZV.png"
              : this.props.currentUser.photoUrl
          }
          alt="demo"
        />
        <div className="media-body">
          <textarea
            className="form-control wysiwyg mt-3"
            name="body"
            style={{
              height: "30",
              border: 1,
              rows: 4
            }}
            contentEditable="true"
            value={this.state.body}
            onChange={e => this.handleChange(e, comment)}
            placeholder="Add reply..."
            suppressContentEditableWarning={true}
          />
          <div className="clearfix">
            {this.renderReplyFormSubmitOrEditBtn(comment)}
            <button
              className="btn btn-secondary float-right btn-xs"
              style={{
                border: 0,
                position: "absolute",
                right: 50
              }}
              type="button"
              onClick={e => {
                this.resetForm(e);
              }}
            >
              <em className="fas mr-1 far fa-trash-alt fa-fw" />
              cancel
            </button>
            {/* <hr /> */}
          </div>
        </div>
      </div>
    );
  };

  renderReplyFormSubmitOrEditBtn = comment => {
    return this.state.editFormIsOpen !== false ? (
      <button
        className="btn btn-secondary btn-xs"
        style={{ border: 0 }}
        type="button"
        onClick={e => this.submitEditContent(e, comment)}
      >
        <em className="fa mr-1 fa-check fa-fw" />
        submit edit
      </button>
    ) : (
      <button
        className="btn btn-secondary btn-xs"
        style={{ border: 0 }}
        type="button"
        onClick={e => this.submitReplyHandler(e, comment)}
      >
        <em className="fa mr-1 fa-check fa-fw" />
        submit
      </button>
    );
  };

  toggleReplyForm = (e, comment) => {
    this.setState({
      id: comment.id,
      title: "REPLY: " + comment.title,
      body: "",
      entityTypeId: this.state.entityTypeId,
      entityId: this.state.entityId,
      parentCommentId: comment.id,
      editFormIsOpen: false,
      toggleReplies: true
    });
    this.setState({
      editForm: false,
      isFormOpen: false
    });
    this.props.openCommentForm();
    console.log(this.state.editForm);
  };

  onGetByParent(comment, e) {
    this.setState({
      toggleReply: !this.state.toggleReply,
      viewReplies: !this.state.viewReplies
    });
    e.stopPropagation();
    this.getAllRepliesByEntity(
      this.props.entityTypeId,
      this.props.entityId,
      comment.id
    )
      .then(response => {
        comment.replies = response.data.items;
        comment.replyId = comment.id;

        this.setState({ replies: [comment.replies] });
        comment.reply = undefined;
      })
      .catch(console.log("on get by parent error"));
  }

  getAllRepliesByEntity(entityTypeId, entityId, parentId) {
    return commentsService.getAllByEntity(
      entityTypeId,
      entityId,
      parentId || this.state.parentCommentId
    );
  }
  submitEditContent(e, comment) {
    let data = {
      id: comment.id,
      title: comment.title,
      body: this.state.admin
        ? this.state.body + " - edited by Admin"
        : this.state.body,
      parentCommentId: 0,
      entityId: comment.entityId,
      entityTypeId: comment.entityTypeId
    };
    commentsService.updateComment(data.id, data).then(() => {
      this.setState({
        body: data.body
      });
      comment.body = this.state.body;
      console.log(this.state.editFormIsOpen);
      data.userId = this.props.currentUser.id;
      this.resetForm();
    });
  }
  editCommentHandler = (e, comment) => {
    e.preventDefault();
    this.setState({
      id: comment.id,
      editFormIsOpen: true,
      title: comment.title,
      body: comment.body,
      parentCommentId: comment.parentCommentId,
      entityId: comment.entityId,
      entityTypeId: comment.entityTypeId
    });
  };

  /////////////////////////////   TOGGLE DROP DOWN
  toggleDropdown = (event, comment) => {
    event.preventDefault();
    this.setState({ isOpen: true, dropdownId: comment.id }, () => {
      document.addEventListener("click", this.closeDropdown);
    });
  };

  closeDropdown = event => {
    if (!this.dropdownMenu.contains(event.target)) {
      this.setState({ isOpen: false }, () => {
        document.removeEventListener("click", this.closeDropdown);
      });
    }
  };
  ///////////////////////// drop down
  renderDropDownButton = comment => {
    return (
      <div className="btn-group float-right">
        <button
          style={{ float: "right", border: 0 }}
          className="btn btn-secondary "
          type="button"
          data-toggle="dropdown"
          aria-expanded="true"
          onClick={e => this.toggleDropdown(e, comment)}
          ref={element => {
            this.dropdownMenu = element;
          }}
        >
          <span className="three-dot-dropdown" />
        </button>
        {this.state.dropdownId === comment.id &&
          this.state.isOpen &&
          this.renderDropdown(comment)}
      </div>
    );
  };
  renderDropdown = comment => {
    return (
      <div
        className="dropdown-menu show float-left"
        role="menu"
        x-placement="bottom-start"
        style={{
          position: "absolute",
          willChange: "transform",
          top: "0px",
          left: "-185px",

          transform: "translate3d(67px, 33px, 0px)"
        }}
      >
        <a
          className="dropdown-item"
          href="#"
          onClick={e => this.editCommentHandler(e, comment)}
        >
          Edit
        </a>
        <div className="dropdown-divider" />
        <a
          className="dropdown-item"
          href="#"
          onClick={e => this.props.deleteCommentHandler(e, comment)}
        >
          Delete
        </a>
      </div>
    );
  };
  toggleReplyOff = comment => {
    comment.reply = undefined;
    this.setState({ viewReplies: false });
  };
  subtractReplyCount = comment => {
    this.setState({ commentCount: this.state.commentCount - 1 });
  };
  viewRepliesCount = comment => {
    let commentCnt = this.state.commentCount;
    return commentCnt > 1 ? (
      <span
        className="btn btn-secondary"
        style={{ border: 0 }}
        type="button"
        onClick={e => this.onGetByParent(comment, e)}
      >
        <em className="fa-1x mr-2 far fa-comment-dots" />
        View {commentCnt} replies
      </span>
    ) : commentCnt === 1 ? (
      <span
        className="btn btn-secondary"
        style={{ border: 0 }}
        type="button"
        onClick={e => this.onGetByParent(comment, e)}
      >
        <em className="fa-1x mr-2 far fa-comment-dots" />
        View reply
      </span>
    ) : null;
  };

  resetForm = () => {
    this.setState({
      id: 0,
      title: "",
      body: ""
    });
  };

  commentBody = comment => {
    if (this.state.id !== comment.id || this.state.toggleReplies) {
      return comment.body;
    } else if (this.state.toggleReplies === false) {
      return this.state.body;
    }
  };
  mapReply = aComment => {
    return (
      <div className="card-body" id={aComment.id} replyid={aComment.id}>
        <div className="media">
          <img
            className="mr-3 rounded-circle thumb48"
            src={
              aComment.photoUrl === null
                ? "https://i.imgur.com/l15inZV.png"
                : aComment.photoUrl
            }
            alt="demo"
          />

          <div className="media-body mb-3">
            <h5>
              <a href="#cardbody">{aComment.userName} </a>
              <small>
                <Moment fromNow>{aComment.dateCreated}</Moment>
              </small>

              {(this.props.currentUser.id === aComment.userId &&
                this.renderDropDownButton(aComment)) ||
                (this.state.admin && this.renderDropDownButton(aComment))}
            </h5>
            <div
              className="body"
              id={aComment.id}
              name="body"
              value={this.state.body}
            >
              {this.commentBody(aComment)}
            </div>
            <div
              className=" d-flex align-items-center"
              style={{ paddingTop: 12 }}
            >
              <span
                className="btn btn-secondary"
                style={{ border: 0 }}
                type="button"
                onClick={e => {
                  this.toggleReplyForm(e, aComment);
                }}
              >
                <em className="fa-1x mr-2 far fa-comment-dots" />
                REPLY
              </span>
              {this.viewRepliesCount(aComment)}
            </div>

            <div>
              {aComment.id === this.state.id && this.renderReplyForm(aComment)}
            </div>
            {/* <hr /> */}
            <div>
              {//aComment.id === aComment.replyId &&
              this.state.viewReplies && (
                <RepliesMap
                  {...this.props}
                  comment={aComment}
                  subtractReplyCount={this.subtractReplyCount}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  userPhoto = comment => {
    return comment.photoUrl || this.props.currentUser.photoUrl === null
      ? "https://imgur.com/l15inZV"
      : comment.photoUrl || this.props.currentUser.photoUrl;
  };

  mapComment = aComment => {
    return (
      <div className="card-body" id={aComment.id} replyid={aComment.id}>
        <div className="media">
          <img
            className="mr-3 rounded-circle thumb48"
            src={
              aComment.photoUrl === null
                ? "https://i.imgur.com/l15inZV.png"
                : aComment.photoUrl
              //aComment.photoUrl
              //|| this.props.currentUser.photoUrl
            }
            alt="demo"
          />

          <div className="media-body mb-3">
            <h5>
              <a href="#cardbody">{aComment.userName}</a>
              <small>
                <Moment fromNow> {aComment.dateCreated}</Moment>
              </small>
              {(this.props.currentUser.id === aComment.userId &&
                this.renderDropDownButton(aComment)) ||
                (this.state.admin && this.renderDropDownButton(aComment))}
            </h5>

            <h5>
              <b>{aComment.title}</b>
            </h5>
            <div
              className="body"
              id={aComment.id}
              name="body"
              value={this.state.body}
            >
              {this.commentBody(aComment)}
              {/* {aComment.body} */}
            </div>
            <div
              className=" d-flex align-items-center"
              style={{ paddingTop: 12 }}
            >
              <span
                className="btn btn-secondary"
                style={{ border: 0 }}
                type="button"
                onClick={e => {
                  this.toggleReplyForm(e, aComment);
                }}
              >
                <em className="fa-1x mr-2 far fa-comment-dots" />
                REPLY
              </span>
              {this.viewRepliesCount(aComment)}
            </div>

            <div>
              {aComment.id === this.state.id && this.renderReplyForm(aComment)}
            </div>
            <div>{this.renderRepliesMap(aComment)}</div>
          </div>
        </div>
      </div>
    );
  };

  renderRepliesMap = aComment => {
    return aComment.replies === undefined
      ? aComment.reply && aComment.reply.map(this.mapReply)
      : this.state.viewReplies &&
          aComment.id === aComment.replyId &&
          aComment.replies && (
            <RepliesMap
              {...this.props}
              comment={aComment}
              reply={this.state.reply}
              subtractReplyCount={this.subtractReplyCount}
            />
          );
  };

  render() {
    return (
      <div>
        <div>{this.mapComment(this.props.comment)}</div>
      </div>
    );
  }
}
export default Comment;
