// Purpose: Helper functions for Handlebars.js templates
module.exports = {
    // format_date will take in a timestamp and return a string with only the date
    format_date: (date) =>
        `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}/${new Date(
            date
        ).getFullYear()}`,
};  