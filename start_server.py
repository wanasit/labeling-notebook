from server import create_app

app = create_app(
    instance_path='/Users/wanasit/Desktop',
    static_folder='./frontend/build'
)


app.run(debug=True)