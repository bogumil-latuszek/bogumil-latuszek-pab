export default class Unique_id_generator {
    max_id: number;

    constructor() {
        this.max_id = 0;
    }
    generate_id() {
        this.max_id++;
        return this.max_id;
    }
    generate_unique_id(_map:Map<number, any> ) {
        let unique = false;
        let unique_id = 0;
        do {
            let id = this.generate_id();
            if (!_map.has(id)) {
                unique = true;
                unique_id = id;
            }
        } while(!unique)
        return unique_id;
    }
}
