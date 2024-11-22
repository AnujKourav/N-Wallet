// Add event listener to the upload button
document.getElementById('uploadFileButton').addEventListener('click', function(e) {
  e.preventDefault(); // Prevent default form submission
  console.log("Upload File button clicked"); // Debugging log

  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;
  let filesArray = [];

  if (files.length === 0) {
      console.log("No files selected"); // Debugging log
      return;
  }

  let filesProcessed = 0;
  for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      reader.onload = function(e) {
          filesArray.push({
              name: files[i].name,
              content: e.target.result
          });
          filesProcessed++;
          if (filesProcessed === files.length) {
              console.log("All files processed:", filesArray); // Debugging log
              saveFilesToLocalStorage(filesArray);
          }
      };
      reader.readAsDataURL(files[i]);
  }
});

function saveFilesToLocalStorage(filesArray) {
  let savedFiles = localStorage.getItem("savedFiles");
  let savedFilesObj;
  if (savedFiles == null) {
      savedFilesObj = [];
  } else {
      savedFilesObj = JSON.parse(savedFiles);
  }

  savedFilesObj = savedFilesObj.concat(filesArray);
  localStorage.setItem("savedFiles", JSON.stringify(savedFilesObj));
  document.getElementById("fileInput").value = ""; // Clear file input
  console.log("Files saved to localStorage:", savedFilesObj); // Debugging log
  displayUploadedFiles();
}

// Function to display uploaded files
function displayUploadedFiles() {
  let savedFiles = localStorage.getItem("savedFiles");
  let savedFilesObj;
  if (savedFiles == null) {
      savedFilesObj = [];
  } else {
      savedFilesObj = JSON.parse(savedFiles);
  }
  let html = "<div class='row'>";
  savedFilesObj.forEach(function(file, index) {
      html += `
          <div class="fileCard my-2 mx-2 card" style="width: 18rem;">
              <div class="card-body">
                  <h5 class="card-title">File ${index + 1}</h5>
                  <p class="card-text"><a href="${file.content}" download="${file.name}">${file.name}</a></p>
              </div>
          </div>`;
      if ((index + 1) % 3 === 0) {
          html += "</div><div class='row'>";
      }
  });
  html += "</div>";
  document.getElementById("uploadedFilesSection").innerHTML = html;
  console.log("Displayed uploaded files:", html); // Debugging log
}

// Function to filter files based on search input
document.getElementById('searchFileTxt').addEventListener('input', function() {
  let searchVal = this.value.toLowerCase();
  let savedFiles = localStorage.getItem("savedFiles");
  let savedFilesObj;
  if (savedFiles == null) {
      savedFilesObj = [];
  } else {
      savedFilesObj = JSON.parse(savedFiles);
  }
  let html = "<div class='row'>";
  savedFilesObj.forEach(function(file, index) {
      if (file.name.toLowerCase().includes(searchVal)) {
          html += `
              <div class="fileCard my-2 mx-2 card" style="width: 18rem;">
                  <div class="card-body">
                      <h5 class="card-title">File ${index + 1}</h5>
                      <p class="card-text"><a href="${file.content}" download="${file.name}">${file.name}</a></p>
                  </div>
              </div>`;
          if ((index + 1) % 3 === 0) {
              html += "</div><div class='row'>";
          }
      }
  });
  html += "</div>";
  document.getElementById("uploadedFilesSection").innerHTML = html;
  console.log("Filtered uploaded files:", html); // Debugging log
});

// Display files on page load
document.addEventListener('DOMContentLoaded', displayUploadedFiles);
