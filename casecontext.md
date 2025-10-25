<Overall Goal>
I am interviewing for a position at HappyRobot as a Forward Deployed Engineer. They gave me a Technical Challenge Case Assignment that involves coding tasks. Your role will be to assist me in writing scalable, efficient, and secure code. Below I will attatch all of the context they gave me in the Case Assignment document. Use this to guide coding tasks.

Some of the project must be completed in the HappyRobot platform, so don't worry about that information. I need help with making the API/Database of load information that can be searched via the platform. Take careful note of the additional considerations, I need the API to be secure and efficient.

I want to impress the interviewers, so let's make the code as clean as possible
</Overall Goal>

<Technical Challenge Specification>

<Overview>
You are meeting with a customer (played by the interviewer) to present a solution you built using the HappyRobot platform. The customer is evaluating vendors to handle inbound carrier load sales automation. Your agent will receive calls from carriers looking to book loads. Your task is to show a working proof of concept and demonstrate both technical depth and customer-centric thinking.
</Overview>

<Goal>
<Objective 1> 
Implement Inbound Use Case
A freight brokerage wants to automate inbound carrier calls. Carriers call in
to request loads. The system must authenticate them, match them to viable
loads, and negotiate pricing automatically.
● Use the HappyRobot platform to create an inbound agent where the AI assistant gets calls from carriers.
● The loads will be searched using an API in a file or DB which will contain the context within the following fields for each load:

<Load Schema>
Field, Description
load_id, Unique identifier for the load
origin, Starting location
destination, Delivery location
pickup_datetime, Date and time for pickup
delivery_datetime, Date and time for delivery
equipment_type, Type of equipment needed
loadboard_rate, Listed rate for the load
notes, Additional information
weight, Load weight
commodity_type, Type of goods
num_of_pieces, Number of items
miles, Distance to travel
dimensions, Size measurements
</Load Schema>
</Objective 1>

<Objective 2>
Deployment and infrastructure
● Containerize the solution with Docker.
</Objective 2>
</Goal>

<Additional Considerations>
1. Security:
If you’re creating an API, add basic security features such as:
○ HTTPS (self-signed locally is fine, use Let’s Encrypt or equivalent if deployed)
○ API key authentication for all endpoints

2. Deployment:
   ○ Deploy your API to a cloud provider of your choice (e.g., AWS, Google Cloud,
   Azure, Fly.io, Railway, etc.)
   ○ Provide clear instructions on how to:
   ■ Access the deployment.
   ■ Reproduce your deployment if needed (e.g., Terraform, shell script, or
   manual steps)
   </Additional Considerations>
   </Technical Challenge Specification>
