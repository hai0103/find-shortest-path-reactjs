import React, { Component } from 'react';
import Konva from 'konva';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Stage, Layer, Ring, Line, Arrow, } from 'react-konva';


function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(p1, p2) {
    let kc;
    kc = Math.sqrt((p1?.x - p2?.x) * (p1?.x - p2?.x) + (p1?.y - p2?.y) * (p1?.y - p2?.y));
    return kc;
}

toast.configure()

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nPoint: 0,
            nLine: 0,
            points: [],
            pointsX: [],
            pointsY: [],
            lines: [],
            linesX: [],
            linesY: [],
            select1: null,
            pointFrom: {},
            pointTo: {},
            select2: null,
            countSelect: 0,
            show: false,
            pathLine: [],
            result: [],
            shortestPath: [],
            v: []
        };
    }

    componentDidMount() {
        this.setState({
            nLine: 0,
            nPoint: 0,
            points: [],
            lines: []
        })
    }

    generatePoint = () => {
        let { nPoint, nLine, points, pointsX, pointsY, linesX, linesY } = this.state;
        let arrX = pointsX;
        let arrY = pointsY;
        let arr = points;
        for (let i = 0; i < nPoint; i++) {
            arrX[i] = getRandomInteger(0, 900);
            arrY[i] = getRandomInteger(0, 600);
            arr.push({ id: i + 1, x: arrX[i], y: arrY[i] })
        }
        this.setState({
            points: arr,
            pointsX: arrX,
            pointsY: arrY
        })
        // console.log(points);

    }

    checkRepeat = () => {

    }

    generateLine = () => {
        let { nPoint, nLine, points, pointsX, pointsY, lines, linesX, linesY } = this.state;
        let arr = lines;
        let temp1 = 0;
        let temp2 = 0;
        for (let i = 0; i < nLine * 2; i += 2) {
            temp1 = getRandomInteger(0, nPoint - 1);
            temp2 = getRandomInteger(0, nPoint - 1);
            while (getDistance(points[temp1], points[temp2]) == 0 || arr.filter(item => (item.p1.id == points[temp1].id && item.p2.id == points[temp2].id) || (item.p1.id == points[temp2].id && item.p2.id == points[temp1].id)).length > 0) {
                temp1 = getRandomInteger(0, nPoint - 1);
                temp2 = getRandomInteger(0, nPoint - 1);
            }
            arr.push({ id: i + 1, p1: points[temp1], p2: points[temp2], length: getDistance(points[temp1], points[temp2]), direction: getRandomInteger(0, 1) })
        }
        this.setState({
            lines: arr
        })
        console.log(arr);
    }

    renderPoint = () => {
        let { nPoint, nLine, points, select1, select2, countSelect, pointFrom, pointTo } = this.state;
        let listPointRen = [];
        points.map((item, index) => {
            listPointRen.push(<Ring
                key={item.id}
                x={item.x}
                y={item.y}
                outerRadius={6}
                shadowBlur={select1 == item.id || select2 == item.id ? 5 : 0}
                fill={select1 == item.id ? "red" : select2 == item.id ? 'green' : "#000"}
                onClick={(e) => {
                    if (countSelect < 2) {
                        if (countSelect == 0)
                            this.setState({
                                select1: item.id,
                                pointFrom: item,
                                pathLine: [],
                                countSelect: 1
                            })
                        else if (countSelect == 1) this.setState({
                            select2: item.id,
                            pointTo: item,
                            pathLine: [],
                            countSelect: 2
                        })
                    } else {
                        this.setState({
                            select1: 0,
                            select2: 0,
                            pathLine: [],
                            result: [],
                            pointFrom: {},
                            pointTo: {},
                            countSelect: 0
                        })
                    }

                }}
            />)
        })
        return listPointRen;
    }

    renderLine = () => {
        let { nPoint, nLine, points, pointsX, pointsY, lines, linesX, linesY, select1, select2, countSelect } = this.state;
        let listLineRen = [];

        lines.map((item, index) => {
            listLineRen.push(<Arrow
                key={item.id}
                points={[item.p1.x, item.p1.y, item.p2.x, item.p2.y]}
                stroke='#ccc'
                fill='#ccc'
                strokeWidth={1}
                strokeHitEnabled={false}
                pointerAtBeginning={item.direction}
            />)
        })
        return listLineRen;
    }

    checkValidLine = (poi1, poi2) => {
        let { points, lines } = this.state;
        let arr = lines;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].p1.id == poi1.id && arr[i].p2.id == poi2.id)
                return true;
            else if ((arr[i].p1.id == poi2.id && arr[i].p2.id == poi1.id && arr[i].direction == 1))
                return true;
        }
        return false;
    }

    findPath = () => {
        let { nPoint, nLine, points, lines, pointFrom, pointTo, shortestPath, v } = this.state;
        console.log(pointFrom, pointTo);
        let source = pointFrom.id;
        let des = pointTo.id;

        let Ddnn = []; //chứa đường đi ngắn nhất từ đỉnh source đến đỉnh t tại mỗi bước:  Ddnn[4]=5 => đi từ 5 -> 4 là ngắn nhất tại bước hiện tại
        let k = 0, Dht = 0, Min = 0;
        let Daxet = []; //đánh dấu các đỉnh đã được đưa vào S(tập điểm đã xét)
        let L = []; // L[i]: tổng độ dài đường từ source đến i
        for (let i = 1; i <= nLine; i++) {
            Ddnn[i] = 0;
        }
        for (let i = 1; i <= nPoint * 1; i++) {
            Daxet[i] = 0;
            L[i] = 100000;
            // Ddnn[i] = 0;
        }
        //Đưa đỉnh source vào tập mảng điểm đã xét
        Daxet[source] = 1;
        L[source] = 0;
        Dht = source;
        let h = 1; // đếm mỗi bước: cho đủ n -1 bước
        while (h <= nPoint * 1 - 1) {
            // while (Daxet[des] == 0) {
            Min = 1000;
            // for (let i = 1; i <= nPoint; i++) {
            //     if (Daxet[i] == 0 && L[Dht] < Min && this.checkValidLine(points[Dht], points[i])) {
            //         Min = L[Dht];
            //         Dht = i;
            //     }
            // }
            // debugger

            for (let i = 1; i <= nPoint; i++) {
                if (!Daxet[i]) {
                    if (L[Dht] + getDistance(points[Dht - 1], points[i - 1]) < L[i] && this.checkValidLine(points[Dht - 1], points[i - 1])) {
                        L[i] = L[Dht] + getDistance(points[Dht - 1], points[i - 1]);
                        Ddnn[i] = Dht;
                        //gắn đỉnh hiện tại là đỉnh trước đỉnh i trên lộ trình
                    }

                    if (L[Dht] < Min && this.checkValidLine(points[Dht - 1], points[i - 1])) {
                        Min = L[Dht];
                        Dht = i;
                        k = i;
                        // Daxet[Dht] = 1;
                    }


                    // else if (i == des && this.checkValidLine(points[Dht - 1], points[i-1])) {
                    //     Ddnn[i] = Dht;
                    //     k = des;
                    //     Dht = i;
                    //     Daxet[Dht] = 1;
                    // }

                    // if (L[i] < Min) {
                    //     Min = L[i];
                    //     k = i;
                    // }

                    if (k == des || Dht == des) {
                        break;
                    }

                }

            }
            if (k == des || Dht == des) {
                break;
            }
            Dht = k;
            Daxet[Dht] = 1;
            h++;
        }

        if (k != des) {
            console.log('Ko tim thay');
            toast.error('Không tìm thấy đường đi phù hợp', {
                autoClose: 1500
            })
        }
        else {
            console.log(Ddnn);
            let temp = 0;
            let listResult = [];
            let end = 0;
            temp = source;
            listResult.push(source);
            while (end != 1) {
                for (let i = 0; i < Ddnn.length; i++) {
                    if (Ddnn[i] == temp) {
                        listResult.push(i);
                        temp = i;
                        if (i == des) {
                            end = 1;
                            break;
                        }
                        break;
                    }
                }
            }
            console.log(listResult)
            let arr = [];
            listResult.map((item, index) => {
                arr.push(points[item - 1])
            })
            console.log(arr)
            this.setState({
                pathLine: arr
            }, () => this.generateLineResult())
        }

    }

    findLine = (poi1, poi2) => {
        let { points, lines } = this.state;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].p1.id == poi1.id && lines[i].p2.id == poi2.id)
                return lines[i];
            else if ((lines[i].p1.id == poi2.id && lines[i].p2.id == poi1.id && lines[i].direction == 1))
                return lines[i];
        }
        return null;
    }

    generateLineResult = () => {
        let { nPoint, nLine, points, lines, pointFrom, pointTo, pathLine, v } = this.state;
        let listLine = [];
        if (pathLine.length > 1) {
            for (let i = 0; i <= pathLine.length - 2; i++) {
                if (this.findLine(points[pathLine[i].id - 1], points[pathLine[i + 1].id - 1]) != null)
                    listLine.push(this.findLine(points[pathLine[i].id - 1], points[pathLine[i + 1].id - 1]))
            }
        }
        console.log(listLine);
        this.setState({
            result: listLine
        })
    }

    renderResult = () => {
        let { nPoint, nLine, points, lines, pointFrom, pointTo, shortestPath, v, result } = this.state;

        let listLineRen = [];

        result.map((item, index) => {
            listLineRen.push(<Arrow
                key={item.id}
                points={[item.p1.x, item.p1.y, item.p2.x, item.p2.y]}
                stroke='red'
                strokeWidth={1}
                pointerAtBeginning={item.direction}
            />)
        })
        return listLineRen;
    }

    render() {
        const { nPoint, nLine, points, pointsX, pointsY, lines, linesX, linesY, select1, select2, countSelect, pointFrom, pointTo } = this.state;
        return (
            <div>
                <div className="container-fluid">
                    <div className="row mt-4">
                        <div className='col-3'>
                            <label className='font-weight-bold'>Số điểm</label>
                            {/* <label className='font-weight-bold'>Số điểm (tối đa: 20)</label> */}
                            <input
                                className="form-control shadow-none font-14"
                                value={this.state.nPoint}
                                type="number"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        this.generatePoint()
                                        this.generateLine()
                                        this.setState({ show: true })
                                    }
                                }}
                                onChange={(e) => {
                                    if (e.target.value * 1 >= 0 && e.target.value * 1 <= 20)
                                        this.setState({
                                            nPoint: e.target.value
                                        })
                                }}
                            />
                            <label className='font-weight-bold'>Số đường</label>
                            {/* <label className='font-weight-bold'>Số đường (tối đa: 400)</label> */}
                            <input
                                className="form-control shadow-none font-14"
                                value={this.state.nLine}
                                type="number"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        this.generatePoint()
                                        this.generateLine()
                                        this.setState({ show: true })
                                    }
                                }}
                                onChange={(e) => {
                                    if (e.target.value * 1 >= 0 && e.target.value * 1 <= 400)
                                        this.setState({
                                            nLine: e.target.value
                                        })
                                }}
                            />
                            <div className='d-flex'>
                                <button
                                    type="button"
                                    className="mt-3 mr-2 btn btn-success btn-sm shadow-none"
                                    onClick={() => {
                                        this.setState({
                                            select1: 0, 
                                            select2: 0,
                                            pointFrom: {},
                                            pointTo: {},
                                            points: [],
                                            lines: [],
                                            pathLine: [],
                                            result: [],
                                            show: false
                                        }, () => {
                                            this.generatePoint()
                                            this.generateLine()
                                            this.setState({ show: true })
                                        })
                                    }}
                                >
                                    Sinh ngẫu nhiên
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 btn btn-light btn-sm shadow-none border"
                                    onClick={() => {
                                        this.setState({
                                            nLine: 0,
                                            nPoint: 0,
                                            select1: 0, 
                                            select2: 0,
                                            pointFrom: {},
                                            pointTo: {},
                                            points: [],
                                            lines: [],
                                            pathLine: [],
                                            result: [],
                                        })
                                    }}
                                >
                                    Refresh
                            </button>
                            </div>

                            <div className='row mt-4'>
                                <div className='col-6'>
                                    <label className='font-weight-bold'>Điểm đầu(Đỏ): {pointFrom?.id}</label>
                                    <div>X1: {pointFrom.x || 'Chưa có'}</div>
                                    <div>Y1: {pointFrom.y || 'Chưa có'}</div>
                                </div>
                                <div className='col-6'>
                                    <label className='font-weight-bold'>Điểm cuối(Xanh): {pointTo?.id}</label>
                                    <div>X2: {pointTo.x || 'Chưa có'}</div>
                                    <div>Y2: {pointTo.y || 'Chưa có'}</div>
                                </div>
                                <div className='col-12'>
                                    <button
                                        disabled={countSelect < 2}
                                        type="button"
                                        className="mt-3 mr-2 btn btn-success btn-sm shadow-none"
                                        onClick={() => {
                                            this.findPath()
                                        }}
                                    >
                                        Tìm đường
                                </button>
                                </div>
                            </div>
                        </div>
                        <div className='col-8'>
                            <div className='border border-success'>
                                <Stage width={900} height={600} className='text-right d-flex justify-content-center'>
                                    <Layer
                                        height={600}
                                        width={900}
                                        container='container'
                                    >
                                        {this.state.show && this.renderLine()}
                                        {this.state.show && this.renderPoint()}
                                        {this.state.show && this.renderResult()}
                                    </Layer>
                                </Stage>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;