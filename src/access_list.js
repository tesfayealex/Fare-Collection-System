module.exports = 
{
async role_access_file (){
    var query =
     [
        {
            id: 50,
            name: 'bus',
            children: [
                { id: 51, name: 'viewer' },
                { id: 52, name: 'editor' },
                { id: 53, name: 'creator' },
            ],
        },
        {
            id: 54,
            name: 'route',
            children: [
              { id: 55, name: 'viewer' },
              { id: 56, name: 'editor' },
              { id: 57, name: 'creator' },
            ],
        },

        {
            id: 58,
            name: 'station',
            children: [
              { id: 59, name: 'viewer' },
              { id: 60, name: 'editor' },
              { id: 61, name: 'creator' },
            ],
        },
        {
          id: 62,
          name: 'branch',
          children: [
            { id: 63, name: 'viewer' },
            { id: 64, name: 'editor' },
            { id: 65, name: 'creator' },
          ],
      }, {
        id: 66,
        name: 'role',
        children: [
          { id: 67, name: 'viewer' },
          { id: 68, name: 'editor' },
          { id: 69, name: 'creator' },
        ],
    }, {
      id: 70,
      name: 'transaction',
      children: [
        { id: 71, name: 'viewer' },
        { id: 72, name: 'editor' },
        { id: 73, name: 'creator' },
      ],
  }, {
    id: 74,
    name: 'ticket',
    children: [
      { id: 75, name: 'viewer' },
      { id: 76, name: 'editor' },
      { id: 77, name: 'creator' },
    ],
}, {
  id: 78,
  name: 'fare',
  children: [
    { id: 79, name: 'viewer' },
    { id: 80, name: 'editor' },
    { id: 81, name: 'creator' },
  ],
}, {
id: 82,
name: 'analysis',
children: [
  { id: 83, name: 'viewer' },
  { id: 84, name: 'editor' },
  { id: 85, name: 'creator' },
],
}, {
id: 86,
name: 'organization',
children: [
  { id: 87, name: 'viewer' },
  { id: 88, name: 'editor' },
  { id: 89, name: 'creator' },
],
}, {
id: 90,
name: 'machine',
children: [
  { id: 91, name: 'viewer' },
  { id: 92, name: 'editor' },
  { id: 93, name: 'creator' },
],
}, {
id: 94,
name: 'customer',
chidren: [
  { id: 95, name: 'viewer' },
  { id: 96, name: 'editor' },
  { id: 97, name: 'creator' },
],
}, {
id: 98,
name: 'help',
children: [
  { id: 99, name: 'viewer' },
  { id: 100, name: 'editor' },
  { id: 101, name: 'creator' },
],
}, {
id: 102,
name: 'notification',
children: [
  { id: 103, name: 'viewer' },
  { id: 104, name: 'editor' },
  { id: 105, name: 'creator' },
       ],
}
    ] 
    return  query 
  }  
}
 /*
station:{
    view: true,
    edit: true,
    process: true,
},
machine:{
    view: true,
    edit: true,
    process: true,
},
customer:{
    'free':{
        view: true,
        edit: true,
        process: true,
    },
    'normal':{
        view: true,
        edit: true,
        process: true,
    }
},
transaction:{
    view: true,
    edit: true,
    process: true,
},
ticket:{
    view: true,
    edit: true,
    process: true,
},
fare:{
    view: true,
    edit: true,
    process: true,
},
notification:{
    view: true,
    edit: true,
    process: true,
},
help_desk:{
    view: true,
    edit: true,
    process: true,
},
organization:{
    view: true,
    edit: true,
    process: true,
},
branch:{
    view: true,
    edit: true,
    process: true,
},
report:{
    view: true,
    edit: true,
    process: true,
},
role:{
    view: true,
    edit: true,
    process: true,
}
*/


