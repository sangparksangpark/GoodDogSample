import React from "react";
import * as commentsService from "../../services/commentsService";
import "../../styles/comments.css";
import RenderCommentForm from "../Comments/RenderForm1";
import Comment from "../Comments/Comment";
import Pagination from "react-paginating";

class CommentsMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      entityTypeId: this.props.entityTypeId,
      entityId: this.props.entityId,
      id: 0,
      title: "",
      body: "",
      isCommentFormOpen: false,
      editFormIsOpen: false,
      totalCount: 0,
      totalPages: 2,
      currentPage: 1,
      pageIndex: 0,
      pageSize: 10,
      admin: false
    };
  }

  componentDidMount() {
    this.getPageData(this.state.pageIndex, 10)
      .then(this.onGetPagedSuccess)
      .catch(this.onGetPagedError);
    //this.isAdmin(this.props.currentUser.roles[0]);
  }
  isAdmin = role => {
    if (role === "Admin") {
      this.setState({ admin: true }, () =>
        console.log("admin", this.state.admin)
      );
    }
  };
  getPageData(pageIndex, pageSize) {
    return commentsService.getPagedByEntity(
      pageIndex,
      pageSize,
      this.state.entityTypeId,
      this.state.entityId,
      0
    );
  }

  onGetPagedSuccess = response => {
    this.setState({
      comments: response.data.item.pagedItems,
      totalCount: response.data.item.totalCount
    });
    console.log(response.data.item.pagedItems);
  };
  onGetPagedError = response => {
    console.log(response);
  };

  handleNewCommentChange = evt => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  };

  submitCommentHandler = e => {
    e.preventDefault();
    let comment = {
      title: this.state.newTitle,
      body: this.state.newBody,
      parentCommentId: 0,
      entityTypeId: this.state.entityTypeId,
      entityId: this.state.entityId
    };

    commentsService
      .submitReply(comment)
      .then(response => {
        comment.id = response.data.item;
        comment.photoUrl = this.props.currentUser.photoUrl;
        comment.userId = this.props.currentUser.id;
        let comments = [comment, ...this.state.comments];
        this.setState({ comments: comments });
      })
      .catch(console.log("Submit Comment Error"));

    this.openForm(false);
    this.resetForm();
    this.handlePageChange(1);
  };

  deleteCommentHandler = (e, comment) => {
    e.preventDefault();
    commentsService
      .deleteComment(comment.id)
      .then(() => {
        let comments = [...this.state.comments];
        let newComments = comments.filter(object => object.id !== comment.id);
        for (let j = 0; j < newComments.length; j++) {
          newComments[j].replies = [];
        }
        this.setState({ comments: [...newComments] }, () =>
          console.log("testpage2.deletecomment - replies", this.state)
        );
      })
      .catch(console.log("delete Error"));
  };

  onRenderCommentForm = e => {
    return this.state.isCommentFormOpen ? (
      <RenderCommentForm
        //handleFormChange={this.handleFormChange}
        handleCommentChange={this.handleNewCommentChange}
        onSubmitComment={this.submitCommentHandler}
        newTitle={this.state.newTitle}
        newBody={this.state.newBody}
        isFormOpen={this.openForm}
      />
    ) : (
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => {
          this.openForm(true);
          this.resetForm();
        }}
      >
        <em className="fa fa-check fa-fw" />
        COMMENT
      </button>
    );
  };

  openForm = bool => {
    this.setState({
      isCommentFormOpen: bool
    });
  };
  resetForm = () => {
    this.setState({
      id: 0,
      newTitle: "",
      newBody: "",
      //title: "",
      newReply: { body: "" }
    });
  };

  mapComment = aComment => {
    return (
      <Comment
        {...this.props}
        comment={aComment}
        deleteCommentHandler={this.deleteCommentHandler}
        key={aComment.id}
        openCommentForm={this.openForm}
      />
    );
  };

  handlePageChange = page => {
    this.setState({
      currentPage: page
    });
    commentsService
      .getPagedByEntity(
        page - 1,
        this.state.pageSize,
        this.state.entityTypeId,
        this.state.entityId,
        0
      )
      .then(this.onGetPagedSuccess)
      .catch(this.onGetPagedError);
  };

  pagination = () => {
    const { currentPage } = this.state;
    return (
      <Pagination
        total={this.state.totalCount}
        limit={this.state.pageSize}
        pageCount={this.state.totalPage}
        currentPage={currentPage}
      >
        {({
          pages,
          currentPage,
          hasNextPage,
          hasPreviousPage,
          previousPage,
          nextPage,
          totalPages,
          getPageItemProps
        }) => (
          <nav>
            <div className="pagination">
              <li
                className="page-item"
                {...getPageItemProps({
                  pageValue: 1,
                  onPageChange: this.handlePageChange
                })}
              >
                <a className="page-link" aria-label="Previous">
                  <span aria-hidden="true">«</span>
                </a>
              </li>
              {hasPreviousPage && (
                <li
                  {...getPageItemProps({
                    pageValue: previousPage,
                    onPageChange: this.handlePageChange
                  })}
                  className="page-item"
                >
                  <a className="page-link">{"<"}</a>
                </li>
              )}
              {pages.map(page => {
                let activePage = null;
                if (currentPage === page) {
                  activePage = { backgroundColor: "#37bc9b" };
                }
                return (
                  <li className="page-item" key={page}>
                    <a
                      className="page-link"
                      style={activePage}
                      {...getPageItemProps({
                        pageValue: page,
                        onPageChange: this.handlePageChange
                      })}
                    >
                      {page}
                    </a>
                  </li>
                );
              })}
              {hasNextPage && (
                <li
                  className="page-item"
                  {...getPageItemProps({
                    pageValue: nextPage,
                    onPageChange: this.handlePageChange
                  })}
                >
                  <a className="page-link">{">"}</a>
                </li>
              )}
              <li
                className="page-item"
                {...getPageItemProps({
                  pageValue: totalPages,
                  onPageChange: this.handlePageChange
                })}
              >
                <a className="page-link" aria-label="Next">
                  <span aria-hidden="true">»</span>
                </a>
              </li>
            </div>
          </nav>
        )}
      </Pagination>
    );
  };

  render() {
    return (
      <div>
        {this.onRenderCommentForm()}
        <div className="card">{this.state.comments.map(this.mapComment)}</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {this.pagination()}
        </div>
      </div>
    );
  }
}
export default CommentsMap;
