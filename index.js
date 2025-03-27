// Global variables declaration for the charts
let chairChart, dhChart;

document.addEventListener('DOMContentLoaded', () => {
    fetchCandidates();
    initializeCharts();
    setupEventListeners();
});

function fetchCandidates() {
    fetch('http://localhost:3000/chairpersons')
        .then(response => response.json())
        .then(chairpersons => {
            displayCandidates(chairpersons, 'chairpersons');
        })
        .catch(error => console.error('Error fetching chairpersons:', error));

    fetch('http://localhost:3000/dhCaptains')
        .then(response => response.json())
        .then(dhCaptains => {
            displayCandidates(dhCaptains, 'DHcaptains');
        })
        .catch(error => console.error('Error fetching dhCaptains:', error));
}

function displayCandidates(candidates, positionName) {
    // Find the container by class name and match it with positionName
    const containers = document.getElementsByClassName('positions');
    let targetContainer;
    
    // Loop through containers to find the one matching the position
    for (let container of containers) {
        const title = container.querySelector('h3').textContent.toLowerCase();
        if (positionName === 'chairpersons' && title.includes('chairperson')) {
            targetContainer = container;
        } else if (positionName === 'DHcaptains' && title.includes('dh captain')) {
            targetContainer = container;
        }
    }

    if (!targetContainer) {
        console.error(`No container found for ${positionName}`);
        return;
    }

    // Clear existing content except the h3
    const h3 = targetContainer.querySelector('h3');
    targetContainer.innerHTML = '';
    targetContainer.appendChild(h3);

    // Add candidates name in the positions display
    candidates.forEach(candidate => {
        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'candidate-box';
        candidateDiv.innerHTML = `
            <img src="./images/user-vector.jpg" alt="${candidate.name}">
            <label>
                ${candidate.name}
                <input type="checkbox" name="${positionName}" value="${candidate.id}">
            </label>
        `;
        targetContainer.appendChild(candidateDiv);
    });
}

function setupEventListeners() {
    // Form submission
    document.getElementById('voting-form').addEventListener('submit', handleSubmit);
    
    // Voter Input validation 
    document.getElementById('voter-name').addEventListener('change', validateInputs);
    document.getElementById('admission-number').addEventListener('change', validateInputs);
    
    // Checkbox monitoring
    document.getElementById('candidates').addEventListener('change', validateCheckboxes);
}

function validateInputs() {
    const name = document.getElementById('voter-name').value.trim();
    const admission = document.getElementById('admission-number').value.trim();
    return name.length > 0 && admission.length > 0;
}

function validateCheckboxes() {
    const chairChecks = document.querySelectorAll('input[name="chairpersons"]:checked');
    const dhChecks = document.querySelectorAll('input[name="DHcaptains"]:checked');
    
    if (chairChecks.length > 1 || dhChecks.length > 1) {
        alert('Please select only one candidate per position!');
        
        if (chairChecks.length > 1) {
            for (let i = 1; i < chairChecks.length; i++) {
                chairChecks[i].checked = false;
            }
        }
        if (dhChecks.length > 1) {
            for (let i = 1; i < dhChecks.length; i++) {
                dhChecks[i].checked = false;
            }
        }
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateInputs()) {
        alert('Please Enter voters name and admission number!');
        return;
    }

    const voterName = document.getElementById('voter-name').value;
    const admissionNum = document.getElementById('admission-number').value;
    const chairVote = document.querySelector('input[name="chairpersons"]:checked');
    const dhVote = document.querySelector('input[name="DHcaptains"]:checked');

    if (!chairVote || !dhVote) {
        alert('Please select one candidate in each position!');
        return;
    }

    try {
        // Check if the voter exists in the db
        const votersResponse = await fetch('http://localhost:3000/voters');
        const voters = await votersResponse.json();
        
        const voterExists = voters.some(voter => voter.admissionNumber === admissionNum);
        if (voterExists) {
            alert('You have already voted, you cannot vote again!');
            return;
        }

        // Add new voter to the database
        await fetch('http://localhost:3000/voters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: voterName,
                admissionNumber: admissionNum
            })
        });

        // Update votes
        await Promise.all([
            updateVote('chairpersons', chairVote.value),
            updateVote('dhCaptains', dhVote.value)
        ]);

        // Update charts
        updateCharts();
        
        // Reset form
        document.getElementById('voting-form').reset();
        alert('Vote submitted successfully!');
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('Error submitting vote. Please try again!');
    }
}

async function updateVote(position, candidateId) {
    const response = await fetch(`http://localhost:3000/${position}/${candidateId}`);
    const candidate = await response.json();
    
    await fetch(`http://localhost:3000/${position}/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: candidate.votes + 1 })
    });
}

function initializeCharts() {
    const chairCtx = document.getElementsByTagName('canvas')[0];
    const dhCtx = document.getElementsByTagName('canvas')[1];

    chairChart = new Chart(chairCtx, {
        type: 'bar',
        data: { labels: [],
                datasets: [{ 
                    label: 'Chairperson position Votes',
                    data: [] 
                }]
              },
        options: { scales: { 
                    y: { beginAtZero: true } 
                    } 
                 }
    });

    dhChart = new Chart(dhCtx, {
        type: 'bar',
        data: { labels: [],
                datasets: [{ 
                    label: 'DH Captain position Votes',
                    data: [] 
                }] 
              },
        options: { scales: { 
                    y: { beginAtZero: true } 
                    } 
                 }
    });

    updateCharts();
}

async function updateCharts() {
    try {
        const chairResponse = await fetch('http://localhost:3000/chairpersons');
        const chairData = await chairResponse.json();

        const dhResponse = await fetch('http://localhost:3000/dhCaptains');
        const dhData = await dhResponse.json();

        // Update Chairperson results chart
        chairChart.data.labels = chairData.map(c => c.name);
        chairChart.data.datasets[0].data = chairData.map(c => c.votes);
        chairChart.update();

        // Update DH Captain results chart
        dhChart.data.labels = dhData.map(c => c.name);
        dhChart.data.datasets[0].data = dhData.map(c => c.votes);
        dhChart.update();
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

//chart.js external api initial javascript
// const ctx = document.getElementById('myChart');
  
// fetch('db.json')
// .then(response => {
//     if (response.ok == true) {
//         return response.json
//     }
// })
// .then(data => {
//     createChart(data , 'bar')
// })

// function createChart(data,type){

//   new Chart(ctx, {
//     type: type,
//     data: {
//       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//       datasets: [{
//         label: 'Number of votes',
//         data: [12, 19, 3, 5, 2, 3],
//         borderWidth: 1
//       }]
//     },
//     options: {
//       scales: {
//         y: {
//           beginAtZero: true
//         }
//       }
//     }
//   });
// };