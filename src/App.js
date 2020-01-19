import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";
import './index.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DatePicker from "react-datepicker";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

const MAIN = "main";
const DETAILS = "details";
const NOTES_PER_PAGE = 7;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: MAIN,
      files: [],
      selectedFile: null
    };
    this.handleDisplayMain = this.handleDisplayMain.bind(this);
    this.handleDisplayDetails = this.handleDisplayDetails.bind(this);
    this.getStoredFiles = this.getStoredFiles.bind(this);
    this.storeFile = this.storeFile.bind(this);
    this.deleteStoredFile = this.deleteStoredFile.bind(this);
    this.titleExists = this.titleExists.bind(this);

    this.getStoredFiles();
  }

  // FILE API
  getStoredFiles() {
    fetch('http://localhost:3001/getFiles')
      .then(res => res.json())
      .then(files => this.setState({ files: files }));
  }

  storeFile(file, isNewFile) {
    if (!isNewFile) {
      this.setState({date: new Date()});
    }
    fetch('http://localhost:3001/saveFile', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file:file,
        date:file.date,
        isNewFile:isNewFile,
        deleteFile:this.state.selectedFile
      })
    }).then(this.getStoredFiles);

    this.setState({page: MAIN});
  }

  deleteStoredFile(fileTitle) {
    fetch('http://localhost:3001/deleteFile', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: fileTitle,
      })
    }).then(this.getStoredFiles);
  }
  // FILE API END

  handleDisplayMain() {
    this.setState({page: MAIN});
  }

  handleDisplayDetails(file) {
    this.setState({
      page: DETAILS,
      selectedFile: file
    });
  }

  titleExists(title, isNewFile) {
    if (!isNewFile) {
      return false;
    }
    for (let i = 0; i < this.state.files.length; i++) {
      if (this.state.files[i].title === title) {
        return true;
      }
    }
    return false;
  }

  render() {
    let displayedPage =
      <MainWindow
        files={this.state.files}
        onDisplayDetails={this.handleDisplayDetails}
        getStoredFiles={this.getStoredFiles}
        deleteStoredFile={this.deleteStoredFile}
      />;
    if (this.state.page === DETAILS) {
      displayedPage =
        <DetailsWindow
          onDisplayMain={this.handleDisplayMain}
          onSaveFile={this.storeFile}
          selectedFile={this.state.selectedFile}
          titleExists={this.titleExists}
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
      filters: {},
      currentPage: 1
    };

    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.enterDetailsView = this.enterDetailsView.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.getFilteredFiles = this.getFilteredFiles.bind(this);
    this.fileHasCategory = this.fileHasCategory.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.filterPage = this.filterPage.bind(this);
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
    this.props.deleteStoredFile(fileTitle);
  }

  findFileByTitle(title) {
    for(let i = 0; i < this.props.files.length; i++) {
      if (this.props.files[i].title === title) {
        return this.props.files[i];
      }
    }
    return null;
  }

  fileHasCategory(file, category) {
    return file.categories.includes(category) || category==="";
  }

  getFilteredFiles(page, displayOnly) {
    let files = this.props.files;
    let filteredFiles = [];
    if (Object.keys(this.state.filters).length === 0) {
      if (displayOnly) {
        return this.filterPage(files);
      }
      return files;
    }
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let d = new Date(file.date);
      d.setSeconds(1);
      let dFrom = new Date(this.state.filters.fromDate);
      let dTo = new Date(this.state.filters.toDate);
      dFrom.setHours(0);
      dFrom.setMinutes(0);
      dFrom.setSeconds(0);
      if (dFrom <= d && dTo >= d && this.fileHasCategory(file, this.state.filters.category)) {
        filteredFiles.push(file);
      }
    }
    if (displayOnly) {
      return this.filterPage(filteredFiles);
    }
    return filteredFiles;
  }

  filterPage(files) {
    let from = (this.state.currentPage - 1) * NOTES_PER_PAGE;
    let to = from + NOTES_PER_PAGE;
    return files.slice(from, to);
  }

  getAllCategories() {
    let files = this.props.files;
    let categories = [];
    for (let i = 0; i < files.length; i++) {
      for (let j = 0; j < files[i].categories.length; j++) {
        let cat = files[i].categories[j];
        if(categories.indexOf(cat) === -1) {
          categories.push(cat);
        }
      }
    }
    return categories;
  }

  handlePageChange(page) {
    this.setState({currentPage:page});
  }

  render() {
    return (
      <div>
        <FilterBar
          categories={this.getAllCategories()}
          onFiltersChange={this.handleFiltersChange}
        />
        <NoteTable
          files={this.getFilteredFiles(this.state.currentPage, true)}
          onEnterDetailsView={this.enterDetailsView}
          onDeleteFile={this.deleteFile}
        />
        <NavigationBar
          files={this.getFilteredFiles(this.state.currentPage, false)}
          onEnterDetailsView={this.enterDetailsView}
          onPageChange={this.handlePageChange}
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
      category: ""
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
    const elements = this.props.categories.map((category) =>
      <option value={category} key={category}>{category}</option>
    );
    const ddl =
    <select name="categoriesList" value={this.state.category} onChange={this.handleCategoryChange} style={{minWidth:75}}>
      {elements}
    </select>;
    return ddl;
  }

  passFilters() {
    let cat = this.state.category;
    if (this.state.category === "" && this.props.categories.length > 0) {
      cat = this.props.categories[0];
    }
    let filters = {fromDate:this.state.fromDate, toDate:this.state.toDate, category:cat};
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
    return this.props.files.map((file) =>
      <tr key={file.title}>
        <td>
          <Button variant="link" onClick={this.enterEditMode} value={file.title}>Edit</Button>
          |
          <Button variant="link" onClick={this.deleteFile} value={file.title}>Delete</Button>
        </td>
        <td>{(new Date(file.date)).toLocaleDateString()}</td>
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
    this.state = {
      currentPage: 1,
    };

    this.enterNewMode = this.enterNewMode.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  enterNewMode() {
    this.props.onEnterDetailsView();
  }

  previousPage() {
    if (this.state.currentPage === 1) {
      return 1;
    }
    this.props.onPageChange(this.state.currentPage-1);
    this.setState({currentPage:this.state.currentPage-1});
  }

  nextPage() {
    let maxPages = Math.ceil(this.props.files.length/NOTES_PER_PAGE);
    if (this.state.currentPage === maxPages) {
      return;
    }
    this.props.onPageChange(this.state.currentPage+1);
    this.setState({currentPage:this.state.currentPage+1});
  }

  render() {
    let maxPages = Math.ceil(this.props.files.length/NOTES_PER_PAGE);
    return (
      <Container>
        <Row>
          <Col>
            <Button variant="link" onClick={this.enterNewMode}>New</Button>
          </Col>
          <Col xs={6}></Col>
          <Col>
            <Button variant="link" size="sm" onClick={this.previousPage}>Previous</Button>
          </Col>
          <Col>Page {this.state.currentPage}/{maxPages}</Col>
          <Col>
            <Button variant="link" size="sm" onClick={this.nextPage}>Next</Button>
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
      file = {"title":"", "content":"", "categories":[], "isMarkdown":false, "date":new Date()};
    }

    this.state = {
      title: file.title,
      content: file.content,
      categories: file.categories,
      isMarkdown: file.isMarkdown,
      date: file.date
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
    let file =  {"title":this.state.title, "content":this.state.content, "categories":this.state.categories, "isMarkdown":this.state.isMarkdown, "date":this.state.date};
    if (this.state.title === "") {
      alert("File title cannot be empty!");
      return;
    } if (this.props.titleExists(this.state.title, this.isNewFile)) {
      alert("A file with that title already exists")
      return;
    }
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
