/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./views/**/*.{html,js,ejs}"],
    theme: {
        extend: {
            height: {
                '128': '32rem',
                '156': '40rem',
                '196': '48rem',
            },
            minHeight: {
                '128': '32rem',
                '156': '40rem',
                '196': '48rem',
            }
        },
    },
    plugins: [],
}