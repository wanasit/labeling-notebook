import os

from labelling.notebook import create_app

module_dir = os.path.dirname(__file__)

def main():
    static_folder = os.path.join(module_dir, '../frontend/build')
    instance_path = os.getcwd()
    print(instance_path, static_folder)
    debug = False
    port = 9888
    app = create_app(
        instance_path=instance_path,
        static_folder=static_folder
    )

    app.run(debug=debug, port=port)