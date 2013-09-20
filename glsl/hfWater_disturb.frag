//Fragment shader for disturbing water simulations
//author: Skeel Lee <skeel@skeelogy.com>

uniform sampler2D uTexture;
uniform sampler2D uObstaclesTexture;
uniform sampler2D uDisturbTexture;

//disturb is masked by obstacles
uniform int uIsDisturbing;
uniform float uDisturbAmount;
uniform float uDisturbRadius;
uniform vec2 uDisturbPos;

//source is not masked by obstacles
uniform int uIsSourcing;
uniform float uSourceAmount;
uniform float uSourceRadius;
uniform vec2 uSourcePos;

//flood is source for every cell
uniform int uIsFlooding;
uniform float uFloodAmount;

varying vec2 vUv;

void main() {

    //read texture from previous step
    //r channel: height
    vec4 t = texture2D(uTexture, vUv);

    //read obstacles texture
    //r channel: whether water is in obstacle
    vec4 tObstacles = texture2D(uObstaclesTexture, vUv);

    //add disturb (will be masked by obstacles)
    if (uIsDisturbing == 1) {
        float len = length(vUv - vec2(uDisturbPos.x, 1.0 - uDisturbPos.y));
        t.r += uDisturbAmount * (1.0 - smoothstep(0.0, uDisturbRadius, len)) * (1.0 - tObstacles.r);
    }

    //add source (will not be masked by obstacles)
    if (uIsSourcing == 1) {
        float len = length(vUv - vec2(uSourcePos.x, 1.0 - uSourcePos.y));
        t.r += uSourceAmount * (1.0 - smoothstep(0.0, uSourceRadius, len));
    }

    //read disturb texture and just add this amount into the system
    //r channel: disturb amount
    vec4 tDisturb = texture2D(uDisturbTexture, vUv);
    t.r += tDisturb.r; // * (1.0 - tObstacles.r);  //but still has to mask the insides of obstacles

    if (uIsFlooding == 1) {
        t.r += uFloodAmount;
    }

    //write out to texture for next step
    gl_FragColor = t;
}