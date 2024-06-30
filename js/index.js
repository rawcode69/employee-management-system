const API_URL = "http://localhost:3000/employees";
const femaleIconHTML = `<i class="bi bi-gender-female">`;
const maleIconHTML = `<i class="bi bi-gender-male">`;

loadAllEmployees();

/*btn newEmployee*/
$('#btn-new-employee').on('click', function () {
    $('#btn-clear').trigger('click');
    enableInputs();
    $('#txt-id').val(generateNewId());
    $('#txt-name').trigger('focus');
});

$('#btn-clear').on('click', function () {
    $('form').trigger('reset');
})

/*To input elements make disable true*/
function enableInputs() {
    $('#txt-name, #txt-address, #cb-department, #rb-male, #rb-female, #btn-save').prop('disabled', false);
}

/*to generate new id*/
function generateNewId() {
    const lastID = 'E-' + ((+$('#tbl-employee > tbody > tr:last-child > td:first-child').text().replace('E-', '') + 1) + "").padStart(3, 0);
    return lastID;
}

/*to load all employee*/
async function loadAllEmployees() {

    await $.ajax(API_URL).then((employees) => {

        if (employees.length) {
            $('#tbl-employee > tfoot').hide();
        } else {
            $('#tbl-employee > tfoot').show();
        }

        employees.forEach(employee => {
            addEmployeeHTML(employee);
        });

        $('#btn-new-employee').trigger('focus');

    }).catch((e) => {
        alert("There was a problem loading employee");
    });
}


/*To add employee to the table*/
function addEmployeeHTML({id, name, department, gender}) {
    const html = `
             <tr tabindex="0">
                <td>${id}</td>
                 <td>
                    <i class="bi bi-gender-${gender.toLowerCase()}"></i>
                    ${name}
                 </td>
                <td>${department}</td>
                <td><i class="bi bi-trash"></i></td>
            </tr>
        `;
    $('#tbl-employee > tbody').append(html);
}

/*Delete employee*/
$('#tbl-employee > tbody').on('click', 'td:last-child > i',
    async (e) => {
        const id = $(e.target).parents('tr').children().first().text();
        try {
            await $.ajax(`${API_URL}/${id}`, {method: 'DELETE'});
            $(e.target).parents('tr').fadeOut(200, () => {
                $(e.target).parents('tr').remove();
            });
        } catch (e) {
            alert("There was a problem deleting employee");
        }
    });

/*Saving a new employee*/
$('form').on('submit', (e) => {
    e.preventDefault();
    if (!isValidate()) return;
    saveEmployee();
});

/*Save employee fn*/
async function saveEmployee() {
    const newEmployee = {
        id: $('#txt-id').val().trim(),
        name: $('#txt-name').val().trim(),
        address: $('#txt-address').val().trim(),
        gender: $('input[name="gender"]:checked').val(),
        department: $('#cb-department').val(),
    }
    try {
        await $.ajax(API_URL, {
            method: 'POST',
            data: JSON.stringify(newEmployee),
            headers: {'Content-Type': 'application/json'},
        });

        console.log(newEmployee);
        addEmployeeHTML(newEmployee);
        alert("Employee Saved Successfully");
    } catch (e) {
        alert("There was a problem save employee");
        console.log(e);
    }
}

/*Validate Fn*/
function isValidate() {

    let isValid = true;

    if ($('#cb-department').val() === 'No-Department') {
        /*todo:this is not working properly*/
        $('#cb-department').addClass('is-invalid').trigger('focus');
    }

    if (!$('input[name="gender"]:checked').length) {
        $('input[name="gender"][type="radio"]').addClass('is-invalid').first().trigger('focus');
        isValid = false;
    }

    if ($('#txt-address').val().trim() < 3) {
        $('#txt-address').addClass('is-invalid').trigger('focus');
        isValid = false;
    }

    if (!/^[A-Za-z ]+$/.test($('#txt-name').val().trim())) {
        $('#txt-name').addClass('is-invalid').trigger('focus');
        isValid = false;
    }
    return isValid;
}

/*Reset the invalid styling*/
$('#txt-name, #txt-address, #cb-department').on('input', (e) => {
    $(e.target).removeClass('is-invalid');
    /*todo:implement this method to react for valid pattern rather just typing*/
});

let selectedRow = null;

/*Set the form data when select an element from table*/
$('#tbl-employee > tbody').on('click', 'tr',
    async (e) => {
        const id = $(e.target).parents('tr').children().first().text();
        selectedRow = $(e.target).parents('tr');

        try {
            const selectedStudent = await $.ajax(`${API_URL}/${id}`);
            console.log(selectedStudent);

            $('#txt-id').val(selectedStudent.id);
            $('#txt-name').val(selectedStudent.name);
            $('#txt-address').val(selectedStudent.address);
            $('#cb-department').val(selectedStudent.department);
            // $('input[name="gender"][type="radio"]').val(selectedStudent.gender)
            if (selectedStudent.gender === 'Male') {
                $('#rb-male').val('Male').prop('checked', true);
            } else {
                $('#rb-female').val('Female').prop('checked', true);
            }
            enableInputs();
            if ($('#txt-name, #txt-address, #cb-department').hasClass('is-invalid')) {
                $('#txt-name, #txt-address, #cb-department').removeClass('is-invalid');
            }


            /*to set the save button as the update button when click the table*/
            $('#btn-save').prop('disabled', false).attr('type', 'button').text("UPDATE").on('click', (e) => {
                if (!isValidate()) {
                    return
                }
                updateEmployee();

            });

        } catch (e) {
            alert("There was a error selecting the employee");
        }
    });

/*todo:This does not need any more*/
$('#tbl-employee > tbody').on('focus', 'tr', (e) => {
    /*todo:What is the difference between focus and focusin*/
    console.log("Working");
    // $(e.target).parents('tr').addClass('focus-list');
    /*todo:what is the reason to parents doesn't work*/
    $(e.target).closest('tr').addClass('focus-list');
});

$('#btn-update').on('click', (e) => {
    e.preventDefault();
    if (!isValidate()) {
        return
    }
    updateEmployee();

});

/*Todo: Complete functionality for delete button*/
$('#tbl-employee > tbody').on('keydown', 'tr', (e) => {
    if (event.which === 46) {
        $(e.target).closest('tr').remove();
    }

});


/*Click event for save button*/
// $('#btn-save').on('click', (e) => {
//     e.preventDefault();
//
//
// });

/*Update employee function*/
async function updateEmployee() {
    const newEmployee = {
        id: $('#txt-id').val().trim(),
        name: $('#txt-name').val().trim(),
        address: $('#txt-address').val().trim(),
        gender: $('input[name="gender"]:checked').val(),
        department: $('#cb-department').val(),
    }

    await $.ajax(`${API_URL}/${newEmployee.id}`, {
        method: 'PATCH',
        data: JSON.stringify(newEmployee),
        headers: {'Content-Type': 'application/json'},
    })
    selectedRow.find("td:nth-child(2)").html(` 
        <i class="bi bi-gender-${newEmployee.gender.toLowerCase()}"></i>${newEmployee.name}`);
    selectedRow.find("td:nth-child(3)").text(newEmployee.department);

    $('#btn-save').text('SAVE');
    /*reset the SAVE button from UPDATE to SAVE*/
    $('#btn-new-employee').trigger('click');
    /*clear the fields and reset id*/
}



























