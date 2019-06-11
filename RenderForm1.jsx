import React from "react";
//let newComment = this.props.newComment;
class RenderForm1 extends React.Component {
  render() {
    return (
      <div className="card card-default" style={{ border: 1 }}>
        <div className="card-body">
          <form action="#">
            <textarea
              className="form-control wysiwyg mt-3"
              name="newTitle"
              style={{
                height: "30"
              }}
              contentEditable="true"
              value={this.props.newTitle}
              //onChange={e => this.props.handleFormChange(e, 'newComment')}
              onChange={this.props.handleCommentChange}
              placeholder="Add a title..."
              suppressContentEditableWarning={true}
            />
            <textarea
              className="form-control wysiwyg mt-3"
              name="newBody"
              style={{
                overflow: "scroll",
                height: "200px",
                maxHeight: "250px"
              }}
              contentEditable="true"
              value={this.props.newBody}
              //onChange={e => this.props.handleFormChange(e, 'newComment')}
              onChange={this.props.handleCommentChange}
              placeholder="Add a comment..."
              suppressContentEditableWarning={true}
            />
            <br />
            <div className="clearfix">
              <div className="float-left">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={e => this.props.onSubmitComment(e)}
                >
                  <em className="fa fa-check fa-fw" />
                  COMMENT
                </button>
              </div>
              <div className="float-right">
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => this.props.isFormOpen(false)}
                >
                  <em className="fas fa-trash-alt fa-fw" />
                  CANCEL
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default RenderForm1;
