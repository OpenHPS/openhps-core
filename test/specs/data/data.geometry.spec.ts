import { expect } from 'chai';
import 'mocha';
import { Point2D } from '../../../src/data/geometry/Point2D';
import { TypedJSON } from 'typedjson';
import { Point3D } from '../../../src/data/geometry/Point3D';
import { Vector2D, Vector3D } from '../../../src';

describe('data', () => {
    describe('geometry', () => {
        describe('point2d', () => {

            it('should be serializable and deserializable', (done) => {
                const point = new Point2D(5, 4);
                const serializer = new TypedJSON(Point2D);
                const serialized = serializer.toPlainJson(point);
                const deserialized = serializer.parse(serialized);
                expect(deserialized.x).to.equal(point.x);
                expect(deserialized.y).to.equal(point.y);
                done();
            });

            it('should be converted to an array', (done) => {
                const point = new Point2D(5, 4);
                expect(point.x).to.equal(point.point[0]);
                expect(point.y).to.equal(point.point[1]);
                done();
            });

            it('should be changed from an array', (done) => {
                const point = new Point2D();
                point.point = [5, 4]
                expect(point.x).to.equal(5);
                expect(point.y).to.equal(4);
                done();
            });

        });
        describe('point3d', () => {

            it('should be serializable and deserializable', (done) => {
                const point = new Point3D(5, 4, 6);
                const serializer = new TypedJSON(Point3D);
                const serialized = serializer.toPlainJson(point);
                const deserialized = serializer.parse(serialized);
                expect(deserialized.x).to.equal(point.x);
                expect(deserialized.y).to.equal(point.y);
                expect(deserialized.z).to.equal(point.z);
                done();
            });

            it('should be converted to an array', (done) => {
                const point = new Point3D(5, 4, 6);
                expect(point.x).to.equal(point.point[0]);
                expect(point.y).to.equal(point.point[1]);
                expect(point.z).to.equal(point.point[2]);
                done();
            });

            it('should be changed from an array', (done) => {
                const point = new Point3D();
                point.point = [5, 4, 6]
                expect(point.x).to.equal(5);
                expect(point.y).to.equal(4);
                expect(point.z).to.equal(6);
                done();
            });

        });
        describe('vector2d', () => {

            it('should be serializable and deserializable', (done) => {
                const vector = new Vector2D(5, 4);
                const serializer = new TypedJSON(Vector2D);
                const serialized = serializer.toPlainJson(vector);
                const deserialized = serializer.parse(serialized);
                expect(deserialized.x).to.equal(vector.x);
                expect(deserialized.y).to.equal(vector.y);
                done();
            });

            it('should be addeable to another vector', (done) => {
                const vector = new Vector2D(5, 4);
                const vector2 = new Vector2D(2, 2);
                vector.add(vector2);
                expect(vector.x).to.equal(7);
                expect(vector.y).to.equal(6);
                done();
            });

            it('should be subtractable from another vector', (done) => {
                const vector = new Vector2D(5, 4);
                const vector2 = new Vector2D(2, 2);
                vector.substract(vector2);
                expect(vector.x).to.equal(3);
                expect(vector.y).to.equal(2);
                done();
            });

        });
        describe('vector3d', () => {

            it('should be serializable and deserializable', (done) => {
                const vector = new Vector3D(5, 4, 6);
                const serializer = new TypedJSON(Vector3D);
                const serialized = serializer.toPlainJson(vector);
                const deserialized = serializer.parse(serialized);
                expect(deserialized.x).to.equal(vector.x);
                expect(deserialized.y).to.equal(vector.y);
                expect(deserialized.z).to.equal(vector.z);
                done();
            });

            it('should be addeable to another vector', (done) => {
                const vector = new Vector3D(5, 4, 6);
                const vector2 = new Vector3D(2, 2, 2);
                vector.add(vector2);
                expect(vector.x).to.equal(7);
                expect(vector.y).to.equal(6);
                expect(vector.z).to.equal(8);
                done();
            });

            it('should be subtractable from another vector', (done) => {
                const vector = new Vector3D(5, 4, 6);
                const vector2 = new Vector3D(2, 2, 2);
                vector.substract(vector2);
                expect(vector.x).to.equal(3);
                expect(vector.y).to.equal(2);
                expect(vector.z).to.equal(4);
                done();
            });

        });
    });
});