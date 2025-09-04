from flask import Flask, render_template, request, jsonify
from rembg import remove
from PIL import Image
import io, base64

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('main.html')


@app.route('/quitar_fondo/', methods=['POST'])
def quitar_fondo():
    
    if 'imagenes' not in request.files:
        return jsonify({'error': 'No se envió ninguna imagen'}), 400

    imagenes = request.files.getlist("imagenes")
    resultados = []

    for img in imagenes:
        input_image = Image.open(img.stream)
        output_image = remove(input_image)

        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG")
        buffer.seek(0)

        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        resultados.append({
            "nombre": img.filename,
            "imagen": f"data:image/png;base64,{img_base64}"
        })

    #print('salio')
    return jsonify({"ok": True, "resultados": resultados}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5002)