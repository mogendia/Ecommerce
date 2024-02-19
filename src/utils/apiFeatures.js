// class ApiFeatures {
//   constructor(mongooseQuery, queryData) {
//     this.mongooseQuery = mongooseQuery;
//     this.queryData = queryData;
//   }
//   paginate() {
//     let { page, size } = this.queryData;

//     if (!page || page <= 0) {
//       page = 1;
//     }
//     if (!size || size <= 0) {
//       size = 3;
//     }
//     this.mongooseQuery
//       .limit(parseInt(size))
//       .skip(parseInt(page - 1) * parseInt(size));
//     return this;
//   }
//   filter() {
//     const excludeQueryParams = ["page", "size", "sort", "search", "fields"];
//     const filterQuery = { ...this.queryData };
//     excludeQueryParams.forEach((param) => {
//       delete filterQuery[param];
//     });
//     this.mongooseQuery.find(
//       JSON.parse(
//         JSON.stringify(filterQuery).replace(
//           /(gt|gte|lt|lte|in|nin|eq|neq)/g,
//           (match) => `$${match}`
//         )
//       )
//     );
//     return this;
//   }
//   sort() {
    
//     if (this.queryData.sort) {
//         this.queryData.sort = this.queryData.sort.split(",").join(" ");
//         this.mongooseQuery.sort(this.queryData.sort);
//     }
//     return this;
// }
//   search() {
//     if (this.queryData.search) {
//       this.mongooseQuery.find({
//         $or: [
//           { name: { $regex: this.queryData.search, $options: "i" } },
//           { description: { $regex: this.queryData.search, $options: "i" } },
//         ],
//       });
//       return this;
//     }
//   }
//   select() {
//     if (this.queryData.select) {
//         this.queryData.select = this.queryData.select.split(",").join(" ");
//         this.mongooseQuery.select(this.queryData.select);
//     }
//     return this;
// }
// }

// export default ApiFeatures;


class ApiFeatures {
  constructor(mongooseQuery, queryData) {
      this.mongooseQuery = mongooseQuery;
      this.queryData = queryData;
  }

  pagination() {
      let page = this.queryData.page * 1 || 1;
      if (page < 0) {
          page = 1;
      }
      let limit = 2;
      let skip = (page - 1) * limit;
      this.mongooseQuery.find({}).skip(skip).limit(limit);
      this.page = page;
      return this;
  }

  sort() {
      if (this.queryData.sort) {
          this.queryData.sort = this.queryData.sort.split(",").join(" ");
          this.mongooseQuery.sort(this.queryData.sort);
      }
      return this;
  }
  filter() {
      let filterObj = { ...this.queryData };
      const queryFilter = ["page", "sort", "select", "search"];
      queryFilter.forEach((q) => {
          delete filterObj[q];
      });
      filterObj = JSON.stringify(filterObj);
      filterObj = filterObj.replace(
          /(gt|gte|lt|lte|in)/g,
          (match) => `$${match}`
      );
      filterObj = JSON.parse(filterObj);
      this.mongooseQuery.find(filterObj);
      return this;
  }

  select() {
      if (this.queryData.select) {
          this.queryData.select = this.queryData.select.split(",").join(" ");
          this.mongooseQuery.select(this.queryData.select);
      }
      return this;
  }

  search() {
      if (this.queryData.search) {
          this.mongooseQuery.find({
              name: { $regex: this.queryData.search, $options: "i" }
          });
      }
      return this;
  }
}

export default ApiFeatures