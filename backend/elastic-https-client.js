const axios = require('axios');

require("dotenv").config();

class ElasticHttpsClient {
    constructor() {
        this.endpoint = process.env.ELASTIC_URL;
        this.apiKey = process.env.ELASTIC_API_KEY;
        this.headers = {
            'Authorization': `ApiKey ${this.apiKey}`
        };
    }

    /**
     * Method to search outorgas by id
     * @param {*} index_name 
     * @param {*} id 
     * @returns 
     */
    async getDocument(index_name, id) {
        try {
            console.log(`Fetching document with id: ${id} from index: ${index_name}`);
            let response = await axios.request({
                method: 'get',
                url: `${this.endpoint}/${index_name}/_doc/${id}`,
                params: {},
                headers: this.headers
            });
            console.log(`Response received for id: ${id}`, response.data);
           
            return response.data;
        } catch (error) {
            console.error(`Error fetching document with id: ${id}`, error);
            throw new Error('Error fetching document');
        }
    }

    async search(index_name, query) {
        try {
            //console.log(`Searching in index: ${index_name} with query:`, query);
            let response = await axios.request({
                method: 'post',
                url: `${this.endpoint}/${index_name}/_search`,
                data: query,
                headers: this.headers
            });
            //console.log(`Search results for index: ${index_name}`, response.data);
            return response.data;
        } catch (error) {
            //console.error(`Error searching in index: ${index_name}`, error.statusText || error.message);
            throw new Error('Error searching index');
        }
    }

    async searchWithScroll(index_name, query, scroll = '1m') {
        try {
            let response = await axios.request({
                method: 'post',
                url: `${this.endpoint}/${index_name}/_search?scroll=${scroll}`,
                data: query,
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            throw new Error('Error searching index with scroll');
        }
    }

    async scroll(scrollId, scroll = '1m') {
        try {
            let response = await axios.request({
                method: 'post',
                url: `${this.endpoint}/_search/scroll`,
                data: {
                    scroll: scroll,
                    scroll_id: scrollId
                },
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            throw new Error('Error performing scroll => ', error);
        }
    }

    async clearScroll(scrollId) {
        try {
            let response = await axios.request({
                method: 'delete',
                url: `${this.endpoint}/_search/scroll`,
                data: {
                    scroll_id: [scrollId]
                },
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            throw new Error('Error clearing scroll');
        }
    }

    async getPIT(index_name, keep_alive = '1m') {
        try{
            const response = await axios.request({
                method: 'post',
                url: `${this.endpoint}/${index_name}/_pit?keep_alive=${keep_alive}`,
                headers: this.headers
            });
            console.log(`PIT created successfully for index: ${index_name}`);
            return response.data.id;        
        }catch(error){ 
            console.error('Error creating PIT:', error);
            throw new Error('Error creating PIT');
        }
    }

    async searchWithPIT(pitId, query) {
        try{
            const response = await axios.request({
                method: 'post',
                url: `${this.endpoint}/_search?pit=${pitId}`,
                data: query,
                headers: this.headers
            });
            console.log(`Search with PIT completed successfully`);
            return response.data;
        }catch(error) {
            console.error('Error performing search with PIT:', error.statusText || error.message);
            throw new Error('Error performing search with PIT(x)');
        }
    }

    async closePIT(pitId) {
        try{
            const response = await axios.request({
                method: 'delete',
                url: `${this.endpoint}/_pit`,
                data: {
                    id: pitId
                },
                headers: this.headers
            });
            console.log(`PIT closed successfully`);
            return response.data;
        }catch(error) {
            console.error('Error closing PIT:', error);
            throw new Error('Error closing PIT');
        }
    }
}

module.exports = new ElasticHttpsClient();