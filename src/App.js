import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import DatePicker from "react-datepicker";
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'

import './index.css';

import "react-datepicker/dist/react-datepicker.css";

class File {
  constructor(title, content, categories, isMarkdown) {
    this.title = title;
    this.content = content;
    this.categories = categories;
    this.isMarkdown = isMarkdown;
    this.date = new Date();
  }
}

const MAIN = "main";
const DETAILS = "details";

let MOCK_CATEGORIES = ["Lime", "Peach", "Pear", "Apple"] // spremeni v function getCategories() ki vrne array stringov
let MOCK_FILES = [
  new File("First", "blalalab", [], false),
  new File("Second", "gjilagkjglčsd", [], true)
]

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: DETAILS,
      files: MOCK_FILES,
      selectedFile: null
    };
    this.handleDisplayMain = this.handleDisplayMain.bind(this);
    this.handleDisplayDetails = this.handleDisplayDetails.bind(this);
    this.saveFile = this.saveFile.bind(this);
  }

  handleDisplayMain() {
    this.setState({page: MAIN});
  }

  handleDisplayDetails(file) {
    this.setState({
      page: DETAILS,
      selectedFile: file
    });
  }

  saveFile(file, isNewFile) {
    if (isNewFile) {
      console.log("save file")
    } else {
      console.log("delete and save file")
    }
    this.setState({page: MAIN});
  }

  render() {
    let displayedPage =
      <MainWindow
        onDisplayDetails={this.handleDisplayDetails}
      />;
    if (this.state.page === DETAILS) {
      displayedPage =
        <DetailsWindow
          onDisplayMain={this.handleDisplayMain}
          onSaveFile={this.saveFile}
          selectedFile={this.state.selectedFile}
        />;
    }
    return (
      <div>
        {displayedPage}
      </div>
    );
  }
}

class MainWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      allFiles: this.getFiles(),
      displayedFiles: this.getFiles()
    };

    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.enterDetailsView = this.enterDetailsView.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
  }

  handleFiltersChange(newFilters) {
    this.setState({filters: newFilters});
  }

  enterDetailsView(fileTitle) {
    if (fileTitle === "") {
      this.props.onDisplayDetails(null);
      return;
    }
    const file = this.findFileByTitle(fileTitle);
    this.props.onDisplayDetails(file)
  }

  deleteFile(fileTitle) {
    MOCK_FILES.splice(MOCK_FILES.indexOf(fileTitle), 1);
    this.setState({allFiles: this.getFiles()});
  }

  findFileByTitle(title) {
    for(let i = 0; i < MOCK_FILES.length; i++) {
      if (MOCK_FILES[i].title === title) {
        return MOCK_FILES[i];
      }
    }
    return null;
  }

  getFiles() {
    return MOCK_FILES;
  }

  render() {
    return (
      <div>
        <FilterBar
          onFiltersChange={this.handleFiltersChange}
        />
        <NoteTable
          onEnterDetailsView={this.enterDetailsView}
          onDeleteFile={this.deleteFile}
        />
        <NavigationBar
          onEnterDetailsView={this.enterDetailsView}
        />
      </div>
    );
  }
}

class FilterBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: new Date(),
      toDate: new Date(),
      category: 'Pear'
    };

    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.getCategoriesDropdown = this.getCategoriesDropdown.bind(this);
    this.passFilters = this.passFilters.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
  }

  handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  handleFromChange = date => {
    this.setState({
      fromDate: date
    });
  };

  handleToChange = date => {
    this.setState({
      toDate: date
    });
  };

  handleCategoryChange(event) {
    this.setState({
      category: event.target.value
    });
  }

  getCategoriesDropdown() {
    const elements = MOCK_CATEGORIES.map((category) =>
      <option value={category} key={category}>{category}</option>
    );
    const ddl =
    <select name="categoriesList" value={this.state.category} onChange={this.handleCategoryChange} style={{minWidth:75}}>
      {elements}
    </select>;
    return ddl;
  }

  passFilters() {
    let filters = [this.state.fromDate, this.state.toDate, this.state.category];
    this.props.onFiltersChange(filters);
  }

  clearFilters() {
    this.props.onFiltersChange([]);
  }

  render() {
    const categoriesDropdown = this.getCategoriesDropdown();
    return (
      <Container className="container">
        <Row className='mt-4'>
          <Col>From:</Col>
          <Col>
            <DatePicker
              selected={this.state.fromDate}
              onChange={this.handleFromChange}
              onChangeRaw={this.handleDateChangeRaw}
            />
          </Col>
          <Col>To:</Col>
          <Col>
            <DatePicker
              selected={this.state.toDate}
              onChange={this.handleToChange}
              onChangeRaw={this.handleDateChangeRaw}
            />
          </Col>
          <Col>Category:</Col>
          <Col>
            {categoriesDropdown}
          </Col>
          <Col>
            <Button variant="secondary" onClick={this.passFilters}>Filter</Button>
          </Col>
          <Col>
            <Button variant="secondary" onClick={this.clearFilters}>Clear</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

class NoteTable extends React.Component {
  constructor(props) {
    super(props);

    this.enterEditMode = this.enterEditMode.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  getTableRows() {
    return MOCK_FILES.map((file) =>
      <tr key={file.title}>
        <td>
          <Button variant="link" onClick={this.enterEditMode} value={file.title}>Edit</Button>
          |
          <Button variant="link" onClick={this.deleteFile} value={file.title}>Delete</Button>
        </td>
        <td>{file.date.toLocaleDateString()}</td>
        <td>{file.title}</td>
      </tr>
    );
  }

  enterEditMode(e) {
    this.props.onEnterDetailsView(e.target.value);
  }

  deleteFile(e) {
    this.props.onDeleteFile(e.target.value);
  }

  render() {
    const tableRows = this.getTableRows();
    return (
      <Table striped bordered hover style={{margin:25}} size="sm">
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </Table>
    );
  }
}

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);

    this.enterNewMode = this.enterNewMode.bind(this);
  }

  enterNewMode() {
    this.props.onEnterDetailsView();
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <Button variant="link" onClick={this.enterNewMode}>New</Button>
          </Col>
          <Col xs={6}></Col>
          <Col>
            <Button variant="link" size="sm">Previous Page</Button>
          </Col>
          <Col>Page 2/3</Col>
          <Col>
            <Button variant="link" size="sm">Next Page</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

class DetailsWindow extends React.Component {
  constructor(props) {
    super(props);

    let file = props.selectedFile;
    this.isNewFile = file === null
    if (this.isNewFile) {
      file = new File("", "", [], false);
    }

    this.state = {
      title: file.title,
      content: file.content,
      categories: file.categories,
      isMarkdown: file.isMarkdown,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSaveFile = this.handleSaveFile.bind(this);
    this.handleMarkdownCheck = this.handleMarkdownCheck.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleMarkdownCheck(event) {
    this.setState({isMarkdown: event.target.checked});
  }

  handleSaveFile() {
    let file = new File(this.state.title, this.state.content);
    this.props.onSaveFile(file, this.isNewFile);
  }

  handleCategoryChange(newCategories) {
    this.setState({categories: newCategories});
  }

  render() {
    return (
      <Form style={{margin:25}}>
        <Row>
          <Col md={1}>
            <Form.Label>Title:</Form.Label>
          </Col>
          <Col md={6}>
            <Form.Control
              placeholder="Title"
              name="title"
              value={this.state.title}
              onChange={this.handleInputChange}
            />
          </Col>
          <Col>
            <Form.Group id="formGridCheckbox">
              <Form.Check
                type="checkbox"
                label="Markdown"
                size="lg"
                defaultChecked={this.state.isMarkdown}
                onChange={this.handleMarkdownCheck}/>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={1}>
            <Form.Label>Content:</Form.Label>
          </Col>
          <Col md={6}>
            <Form.Control
              as="textarea"
              rows="5"
              name="content"
              placeholder="Content"
              value={this.state.content}
              onChange={this.handleInputChange}
             />
          </Col>
        </Row>
        <CategoriesSelection
          categories={this.state.categories}
          onCategoryChange={this.handleCategoryChange}
        />
        <Button variant="secondary" onClick={this.handleSaveFile} style={{margin:5}}>Save</Button>
        <Button variant="secondary" onClick={this.props.onDisplayMain} style={{margin:5}}>Cancel</Button>
      </Form>
    );
  }
}

class CategoriesSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryText: "",
      categories : this.props.categories
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.removeCategory = this.removeCategory.bind(this);
  }

  handleInputChange(event) {
    this.setState({categoryText: event.target.value});
  }

  addCategory(event) {
    let categories = this.state.categories;
    for(let i = 0; i < categories.length; i++) {
      if (categories[i] === this.state.categoryText) {
        return;
      }
    }
    categories.push(this.state.categoryText);
    this.setState({categories: categories});
    this.props.onCategoryChange(categories);
  }

  removeCategory(event) {
    let categories = this.state.categories;
    let newCategories = [];
    for(let i = 0; i < categories.length; i++) {
      if (categories[i] !== this.state.categoryText) {
        newCategories.push(categories[i]);
      }
    }
    this.setState({categories: newCategories});
    this.props.onCategoryChange(newCategories);
  }

  render() {
    let tableRows = this.state.categories.map((category) =>
      <tr key={category}>
        <td>{category}</td>
      </tr>
    );
    return (
      <Row style={{marginTop:25}}>
        <Col md={1}>
          <Form.Label>Categories:</Form.Label>
        </Col>
        <Col md={2}>
          <Table striped bordered hover size="sm">
            <tbody>
              {tableRows}
            </tbody>
          </Table>
        </Col>
        <Col md={1}>
          <Form.Label>Category Name:</Form.Label>
        </Col>
        <Col md={3}>
          <Form.Control
            placeholder="Category name"
            value={this.state.title}
            onChange={this.handleInputChange}
          />
        </Col>
        <Col md={2}>
          <Button variant="secondary" onClick={this.addCategory} style={{margin:5}}>Add</Button>
          <Button variant="secondary" onClick={this.removeCategory} style={{margin:5}}>Remove</Button>
        </Col>
      </Row>
    )
  }
}

export default App;
